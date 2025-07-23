import { useProgramState } from "@/hooks/useProgram";

import Toast from "@/components/Toast";

import { useState, useRef, useEffect } from "react";

import styles from "./CreateMarketForm.module.scss";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { HiPlus } from "react-icons/hi";
import { Input, Button, Icon, Container, Segment } from "semantic-ui-react";
import UtilsMaps from "@/utils/web3/Maps/UtilsMaps";
import CreateShippingModal from "@/components/Account/CreateAccountForm/ShippingAccount/CreateShippingForm";

const center = { lat: 19.511567494105133, lng: -99.12669760284929 };
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export default function CreateMarketForm(props) {
  const searchInput = useRef(null);
  const { showModal, setShowModal, editMarket, marketOwner } = props;

  const [text, setText] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [market_name, setMarket_name] = useState("");
  const [market_focuses_on, setMarket_focuses_on] = useState("");
  const [market_available, setMarket_available] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [state, setState] = useState("");
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [zip, setZip] = useState("");
  const [num_ext, setNum_ext] = useState("");
  const [num_int, setNum_int] = useState("");
  const [number_phone, setNumber_phone] = useState("");
  const [address, setAddress] = useState({});
  const [markerPosition, setMarkerPosition] = useState(undefined);

  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [market_id, setMarket_id] = useState("");
  const [yes, setYes] = useState(["0", "1"]);
  const [emailRegex, setEmailRegex] = useState(
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  );
  const [zipRegex, setZipRegex] = useState(/^\d{5}$/);
  const [numberRegex, setNumberRegex] = useState(/^\d+$/);
  const [phoneRegex, setPhoneRegex] = useState(/^\d{10}$/);
  const [nameRegex, setNameRegex] = useState(/^[\w\d\s]{1,20}$/);

  const titleModal = `Create Market`;
  const { createMarket, updateMarket } = useProgramState();

  const onCreate = async (e) => {
    if (!nameRegex.test(market_name)) {
      setText(
        "El nombre del negocio debe contener solo letras y números, y tener una longitud igual o menor a 20"
      );
      setShowToast(true);
      return null;
    } else if (market_name.length == 0) {
      setText("El nombre del negocio no debe estar vacio");
      setShowToast(true);
      return null;
    } else if (market_focuses_on.length == 0) {
      setText("El nombre del giro no debe estar vacio");
      setShowToast(true);
      return null;
    } else if (!yes.includes(market_available)) {
      alert(market_available);
      setText(
        "Por favor selecciona si el negocio se encuentra abierto o cerrado"
      );
      setShowToast(true);
      return null;
    } else if (email.length == 0 || !emailRegex.test(email)) {
      setText(
        "El correo electronico no debe estar vacio y debe cumplir con el formato requerido"
      );
      setShowToast(true);
      return null;
    } else if (street.length == 0) {
      setText("La calle no debe estar vacia");
      setShowToast(true);
      return null;
    } else if (state.length == 0) {
      setText("El estado no debe estar vacio");
      setShowToast(true);
      return null;
    } else if (colonia.length == 0) {
      setText("La colonia no debe estar vacia");
      setShowToast(true);
      return null;
    } else if (municipio.length == 0) {
      setText("El municipio no debe estar vacio");
      setShowToast(true);
      return null;
    } else if (zip.length == 0 || !zipRegex.test(zip)) {
      setText(
        "El codigo postal no debe estar vacio y unicamente debe tener 5 numeros"
      );
      setShowToast(true);
      return null;
    } else if (num_ext.length == 0 || !numberRegex.test(num_ext)) {
      setText(
        "El numero exterior no debe estar vacio y debe incluir unicamente numeros. Si es SN, pon 0"
      );
      setShowToast(true);
      return null;
    } else if (number_phone.length != 10 || !phoneRegex.test(number_phone)) {
      setText(
        "El numero telefonico no debe estar vacio y unicamente deben ser 10 digitos"
      );
      setShowToast(true);
      return null;
    } else if (lat == "" || long == "") {
      setText("Faltan coordenadas. Usa el mapa de google maps");
      setShowToast(true);
      return null;
    }

    if (market_available) e.preventDefault();

    if (editMarket) {
      await updateMarket(
        marketOwner.owner,
        marketOwner.id,
        market_name.toString(),
        market_focuses_on.toString(),
        market_available.toString(),
        email.toString(),
        street.toString(),
        state.toString(),
        colonia.toString(),
        municipio.toString(),
        zip.toString(),
        num_ext.toString(),
        num_int.toString(),
        number_phone.toString(),
        lat.toString(),
        long.toString(),
        market_id.toString()
      );
    } else {
      await createMarket(
        market_name.toString(),
        market_focuses_on.toString(),
        market_available.toString(),
        email.toString(),
        street.toString(),
        state.toString(),
        colonia.toString(),
        municipio.toString(),
        zip.toString(),
        num_ext.toString(),
        num_int.toString(),
        number_phone.toString(),
        lat.toString(),
        long.toString(),
        market_id.toString()
      );
    }
  };

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const extractAddress = (place) => {
    const address = {
      city: "",
      state: "",
      zip: "",
      country: "",
      route: "",
      street_number: "",
      //posición en coordenadas
      position: { lat: null, lng: null },
      plain() {
        const city = this.city ? this.city + ", " : "";
        const zip = this.zip ? this.zip + ", " : "";
        const state = this.state ? this.state + ", " : "";
        const route = this.route ? this.route + ", " : "";
        const street_number = this.street_number
          ? this.street_number + ", "
          : "";

        return city + zip + state + route + street_number + this.country;
      },
    };

    if (place?.geometry?.location) {
      address.position.lat = place.geometry.location.lat();
      address.position.lng = place.geometry.location.lng();
    }

    if (!Array.isArray(place?.address_components)) {
      return address;
    }

    place.address_components.forEach((component) => {
      const types = component.types;
      const value = component.long_name;

      if (types.includes("locality")) {
        address.city = value;
        setMunicipio(address.city);
      }

      if (types.includes("administrative_area_level_2")) {
        address.state = value;
      }

      if (types.includes("postal_code")) {
        address.zip = value;
        setZip(address.zip);
      }
      if (types.includes("route")) {
        address.route = value;
        setStreet(address.route);
      }
      if (types.includes("street_number")) {
        address.street_number = value;
        setNum_ext(address.street_number);
      }

      if (types.includes("country")) {
        address.country = value;
      }
    });

    return address;
  };

  const onChangeAddress = (autocomplete, setAddress) => {
    const place = autocomplete.getPlace();
    const newAddress = extractAddress(place);
    setAddress(extractAddress(place));
    setMarkerPosition(newAddress.position);
  };

  const initAutocomplete = (searchInput, setAddress) => {
    if (!searchInput.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      searchInput.current
    );
    autocomplete.setFields(["address_component", "geometry"]);
    autocomplete.addListener("place_changed", () =>
      onChangeAddress(autocomplete, setAddress, setMarkerPosition)
    );
  };

  const onMarkerDragEnd = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPosition = { lat, lng };

    if (
      parseFloat(
        UtilsMaps.calcularDistancia(
          lat,
          lng,
          markerPosition.lat,
          markerPosition.lng
        )
      ) > 0.2
    ) {
      setText(
        "No es posible mover el marcador a una distancia mayor a 200m de la dirección"
      );
      setShowToast(true);
      setMarkerPosition(markerPosition);
    } else {
      setMarkerPosition(newPosition);
      console.log(markerPosition);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      initAutocomplete(searchInput, setAddress, setMarkerPosition);

      if (editMarket) {
        console.log(marketOwner);
        setColonia(marketOwner.colonia);
        setEmail(marketOwner.email);
        setMarkerPosition({
          lat: parseFloat(marketOwner.lat),
          lng: parseFloat(marketOwner.long),
        });
        setMarket_focuses_on(marketOwner.marketFocusesOn);
        setMarket_name(marketOwner.marketName);
        setStreet(marketOwner.street);
        setMunicipio(marketOwner.municipio);
        setState(marketOwner.state);
        setNum_ext(marketOwner.numExt);
        setNum_int(marketOwner.numInt);
        setNumber_phone(marketOwner.numberPhone);
        setZip(marketOwner.zip);
        setLat(marketOwner.lat);
        setLong(marketOwner.long);
      }
    }
  }, [isLoaded]);

  if (address) console.log(address);

  if (!isLoaded) return <div>Loading...</div>;
  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  if (!isLoaded) return <div>Loading...</div>;
  if (loadError)
    return <div>Error loading Google Maps API: {loadError.message}</div>;

  return (
    <>
      {showModal && (
        <>
          <MarketForm
            onCreate={onCreate}
            setMarket_name={setMarket_name}
            setMarket_focuses_on={setMarket_focuses_on}
            setMarket_available={setMarket_available}
            yes={yes}
          />
          <CreateShippingModal
            marketOwner={marketOwner}
            editMarket={editMarket}
            email={email}
            setEmail={setEmail}
            street={street}
            setStreet={setStreet}
            state={state}
            setState={setState}
            colonia={colonia}
            setColonia={setColonia}
            municipio={municipio}
            setMunicipio={setMunicipio}
            zip={zip}
            setZip={setZip}
            num_ext={num_ext}
            setNum_ext={setNum_ext}
            num_int={num_int}
            setNum_int={setNum_int}
            number_phone={number_phone}
            setNumber_phone={setNumber_phone}
            lat={lat}
            setLat={setLat}
            long={long}
            setLong={setLong}
            onCreate={onCreate}
            address={address}
            markerPosition={markerPosition}
            searchInput={searchInput}
            onMarkerDragEnd={onMarkerDragEnd}
            market_name={market_name}
            setMarket_name={setMarket_name}
            market_focuses_on={market_focuses_on}
            setMarket_focuses_on={setMarket_focuses_on}
            market_available={market_available}
            setMarket_available={setMarket_available}
            yes={yes}
            showToast={showToast}
            setShowToast={setShowToast}
            setAddress={setAddress}
            setMarkerPosition={setMarkerPosition}
            setText={setText}
            text={text}
          />

          {!editMarket && (
            <div className={styles.createShipping_button}>
              <button onClick={onCreate} type="button">
                <HiPlus size={30} />
                <a>{"Crear Market"}</a>
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  function MarketForm(props) {
    const {
      onCreate,
      setMarket_name,
      setMarket_focuses_on,
      setMarket_available,
      yes,
    } = props;

    return <></>;
  }
}
