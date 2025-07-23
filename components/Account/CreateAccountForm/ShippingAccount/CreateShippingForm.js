import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useRef, useEffect } from "react";
import { useProgramState } from "@/hooks/useProgram";
import MainModal from "@/components/Modal/MainModal/MainModal";
import styles from "./CreateShippingForm.module.scss";
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
import Toast from "@/components/Toast/Toast";
import { useRouter } from "next/router";
import { set } from "lodash";

const center = { lat: 19.511567494105133, lng: -99.12669760284929 };
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const geocodeJson = "https://maps.googleapis.com/maps/api/geocode/json";

export default function CreateShippingModal(props) {
  const {
    marketOwner,
    editMarket,
    setShowModal,
    showToast,
    setShowToast,
    yes,
    label,
    setLabel,
    email,
    setEmail,
    street,
    setStreet,
    state,
    setState,
    colonia,
    setColonia,
    municipio,
    setMunicipio,
    zip,
    setZip,
    num_ext,
    setNum_ext,
    num_int,
    setNum_int,
    number_phone,
    setNumber_phone,
    lat,
    setLat,
    long,
    setLong,
    onCreateNew,
    address,
    setAddress,
    markerPosition,
    setMarkerPosition,
    text,
    setText,
    market_name,
    market_focuses_on,
    market_available,
    setMarket_name,
    setMarket_focuses_on,
    setMarket_available,
  } = props;

  const [emailRegex, setEmailRegex] = useState(
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  );
  const [zipRegex, setZipRegex] = useState(/^\d{5}$/);
  const [numberRegex, setNumberRegex] = useState(/^\d+$/);
  const [phoneRegex, setPhoneRegex] = useState(/^\d{10}$/);
  const [nameRegex, setNameRegex] = useState(/^[\w\d\s]{1,20}$/);

  const [market_id, setMarket_id] = useState("");

  const searchInput = useRef(null);

  const { createShipping } = useProgramState();

  const { updateMarket } = useProgramState();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });
  const router = useRouter();
  const extractAddress = (place) => {
    setText(
      "Puedes mover el marker para especificar tu direcciónen un radio de <= 200 metros"
    );
    setShowToast(true);

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
      setLat(address.position.lat);
      setLong(address.position.lng);
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
      setLat(null);
      setLong(null);
      setMarkerPosition(null);
    } else {
      setLat(lat);
      setLong(lng);
      setMarkerPosition(newPosition);
      console.log(markerPosition);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      initAutocomplete(searchInput, setAddress, setMarkerPosition);
    }
  }, [isLoaded]);

  if (address) console.log(address);

  const onEditMarket = async (e) => {
    if (!nameRegex.test(market_name)) {
      setText(
        "El nombre del negocio debe contener solo letras y números, y tener una longitud igual o menor a 20"
      );
      setShowToast(true);
      return null;
    }
    if (market_name.length == 0) {
      setText("El nombre del negocio no debe estar vacio");
      setShowToast(true);
      return null;
    }
    if (market_focuses_on.length == 0) {
      setText("El nombre del giro no debe estar vacio");
      setShowToast(true);
      return null;
    }
    if (!yes.includes(market_available)) {
      setText(
        "Por favor selecciona si el negocio se encuentra abierto o cerrado"
      );
      setShowToast(true);
      return null;
    }
    if (email.length == 0 || !emailRegex.test(email)) {
      setText(
        "El correo electronico no debe estar vacio y debe cumplir con el formato requerido"
      );
      setShowToast(true);
      return null;
    }
    if (street.length == 0) {
      setText("La calle no debe estar vacia");
      setShowToast(true);
      return null;
    }
    if (state.length == 0) {
      setText("El estado no debe estar vacio");
      setShowToast(true);
      return null;
    }
    if (colonia.length == 0) {
      setText("La colonia no debe estar vacia");
      setShowToast(true);
      return null;
    }
    if (municipio.length == 0) {
      setText("El municipio no debe estar vacio");
      setShowToast(true);
      return null;
    }
    if (zip.length == 0 || !zipRegex.test(zip)) {
      setText(
        "El codigo postal no debe estar vacio y unicamente debe tener 5 numeros"
      );
      setShowToast(true);
      return null;
    }
    if (num_ext.length == 0 || !numberRegex.test(num_ext)) {
      setText(
        "El numero exterior no debe estar vacio y debe incluir unicamente numeros. Si es SN, pon 0"
      );
      setShowToast(true);
      return null;
    }
    if (number_phone.length != 10 || !phoneRegex.test(number_phone)) {
      setText(
        "El numero telefonico no debe estar vacio y unicamente deben ser 10 digitos"
      );
      setShowToast(true);
      return null;
    }
    if (lat == "" || long == "") {
      setText("Faltan coordenadas. Usa el mapa de google maps");
      setShowToast(true);
      return null;
    }

    e.preventDefault();

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
    }
    router.reload();
  };

  const onCreateShipping = async (e) => {
    if (label.length == 0) {
      setText("El alias no debe estar vacío");
      setShowToast(true);
      return null;
    }
    if (email.length == 0 || !emailRegex.test(email)) {
      setText(
        "El correo electronico no debe estar vacio y debe cumplir con el formato requerido"
      );
      setShowToast(true);
      return null;
    }
    if (street.length == 0) {
      setText("La calle no debe estar vacia");
      setShowToast(true);
      return null;
    }
    if (state.length == 0) {
      setText("El estado no debe estar vacio");
      setShowToast(true);
      return null;
    }
    if (colonia.length == 0) {
      setText("La colonia no debe estar vacia");
      setShowToast(true);
      return null;
    }
    if (municipio.length == 0) {
      setText("El municipio no debe estar vacio");
      setShowToast(true);
      return null;
    }
    if (zip.length == 0 || !zipRegex.test(zip)) {
      setText(
        "El codigo postal no debe estar vacio y unicamente debe tener 5 numeros"
      );
      setShowToast(true);
      return null;
    }
    if (num_ext.length == 0 || !numberRegex.test(num_ext)) {
      setText(
        "El numero exterior no debe estar vacio y debe incluir unicamente numeros. Si es SN, pon 0"
      );
      setShowToast(true);
      return null;
    }
    if (number_phone.length != 10 || !phoneRegex.test(number_phone)) {
      setText(
        "El numero telefonico no debe estar vacio y unicamente deben ser 10 digitos"
      );
      setShowToast(true);
      return null;
    }
    if (!lat || !long) {
      setText("Debes usar el buscador de Google Maps para buscar tu dirección");
      setShowToast(true);
      return null;
    }
    e.preventDefault();

    await createShipping(
      label.toString(),
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
      long.toString()
    );
    router.reload();
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  if (!isLoaded) return <div>Loading...</div>;
  if (loadError)
    return <div>Error loading Google Maps API: {loadError.message}</div>;

  return (
    <>
      {yes && (
        <div className={styles.createShipping_wrapper_form}>
          <div className={styles.createMarket_wrapper}>
            <div className={styles.createMarket_wrapper_form}>
              <div className={styles.createMarket_form}>
                <label htmlFor="location">
                  <span>Business name</span>
                  <input
                    onChange={(e) => setMarket_name(e.target.value)}
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Tortas Nacho, Papeleria Lupita"
                    value={market_name || ""}
                  />
                </label>

                <label htmlFor="imageURL">
                  <span>Giro</span>
                  <input
                    onChange={(e) => setMarket_focuses_on(e.target.value)}
                    type="text"
                    id="imageURL"
                    name="imageURL"
                    placeholder="Comida, Servicio"
                    value={market_focuses_on || ""}
                  />
                </label>

                <label htmlFor="imageURL">
                  <span>Availability</span>

                  <select
                    type="text"
                    onChange={(e) => setMarket_available(e.target.value)}
                  >
                    <option value={null} selected>
                      Select Availability
                    </option>

                    <option value={yes[1]}>Open</option>

                    <option value={yes[0]}>Closed</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <UserForm
        editMarket={editMarket}
        label={label}
        setLabel={setLabel}
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
        setLat={setLat}
        setLong={setLong}
        address={address}
        markerPosition={markerPosition}
        searchInput={searchInput}
        onMarkerDragEnd={onMarkerDragEnd}
        onCreateNew={onCreateNew}
        yes={yes}
        market_name={market_name}
        setMarket_name={setMarket_name}
        market_focuses_on={market_focuses_on}
        setMarket_focuses_on={setMarket_focuses_on}
        market_available={market_available}
        setMarket_available={setMarket_available}
      />

      {editMarket && (
        <>
          <div className={styles.createShipping_button}>
            <button onClick={onEditMarket} type="button">
              <HiPlus size={30} />
              <a>Edit Market</a>
            </button>
          </div>
        </>
      )}

      {!editMarket && !yes && (
        <>
          <div className={styles.createShipping_button}>
            <button onClick={onCreateShipping} type="button">
              <HiPlus size={30} />
              <a>Add Address</a>
            </button>
          </div>
        </>
      )}

      <Toast showToast={showToast} setShowToast={setShowToast} text={text} />
    </>
  );
}

function UserForm(props) {
  const {
    label,
    setLabel,
    email,
    setEmail,
    street,
    setStreet,
    state,
    setState,
    colonia,
    setColonia,
    municipio,
    setMunicipio,
    zip,
    setZip,
    num_ext,
    setNum_ext,
    num_int,
    setNum_int,
    number_phone,
    setNumber_phone,
    setLat,
    setLong,
    onCreate,
    address,
    markerPosition,
    searchInput,
    onMarkerDragEnd,
    yes,
    market_name,
    market_focuses_on,
    market_available,
    setMarket_name,
    setMarket_focuses_on,
    setMarket_available,
  } = props;

  return (
    <div className={styles.createShipping_wrapper}>
      <div className={styles.createShipping_header}>
        <div className={styles.search}>
          <Input
            ref={(input) => (searchInput.current = input?.inputRef.current)}
            icon={<Icon name="search" />}
            placeholder="Find you address . . ."
          />

          <Button onClick={() => findMyLocation(reverseGeocode)} icon>
            <Icon name="location arrow" />
          </Button>
        </div>
      </div>

      <div className={styles.createShipping_wrapper_form}>
        <div className={styles.map_container}>
          <GoogleMap
            defaultZoom={3}
            //si no se ha puesto una dirección, se redirige al centro que es
            center={markerPosition ? markerPosition : center}
            zoom={15}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              clickableIcons: false,
            }}
          >
            {markerPosition && (
              <Marker
                position={markerPosition}
                draggable={true}
                onDragEnd={(e) => onMarkerDragEnd(e)}
              />
            )}
          </GoogleMap>
        </div>
        {markerPosition && (
          <>
            <div className={styles.createShipping_form}>
              {!yes && (
                <label htmlFor="label">
                  <span>Alias</span>
                  <input
                    onChange={(e) => setLabel(e.target.value)}
                    type="text"
                    id="label"
                    name="label"
                    placeholder="Casa Mama, Casa Centro, Trabajo"
                    value={label || ""}
                  />
                </label>
              )}

              <label htmlFor="email">
                <span>Email</span>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  id="email"
                  name="email"
                  placeholder="MiCorreo@gmail.com"
                  value={email || ""}
                />
              </label>

              <label htmlFor="street">
                <span>Street</span>
                <input
                  onChange={(e) => setStreet(e.target.value)}
                  type="text"
                  id="street"
                  name="street"
                  value={street || ""}
                  placeholder="Altamirano, Ambato"
                />
              </label>

              <label htmlFor="state">
                <span>State</span>
                <input
                  onChange={(e) => setState(e.target.value)}
                  type="text"
                  id="state"
                  name="state"
                  placeholder="Hidalgo, CDMX"
                  value={state || ""}
                />
              </label>

              <label htmlFor="colonia">
                <span>Colonia</span>
                <input
                  onChange={(e) => setColonia(e.target.value)}
                  type="text"
                  id="colonia"
                  name="colonia"
                  placeholder="Lindavista Norte, Centro"
                  value={colonia || ""}
                />
              </label>
            </div>
            <div className={styles.createShipping_form2}>
              <label htmlFor="municipio">
                <span className="text-xs font-light">Municipality</span>
                <input
                  onChange={(e) => setMunicipio(e.target.value)}
                  type="text"
                  id="municipio"
                  name="municipio"
                  placeholder="Municipio"
                  value={municipio || ""}
                />
              </label>

              <label htmlFor="zip">
                <span>Postal Code</span>
                <input
                  onChange={(e) => setZip(e.target.value)}
                  type="text"
                  id="zip"
                  name="zip"
                  placeholder="Codigo postal"
                  value={zip || ""}
                />
              </label>

              <label htmlFor="num_ext">
                <span>External number</span>
                <input
                  onChange={(e) => setNum_ext(e.target.value)}
                  type="text"
                  id="num_ext"
                  name="num_ext"
                  placeholder="SN"
                  value={num_ext || ""}
                />
              </label>

              <label htmlFor="num_int">
                <span>Internal number</span>
                <input
                  onChange={(e) => setNum_int(e.target.value)}
                  type="text"
                  id="num_int"
                  name="num_int"
                  placeholder="SN"
                  value={num_int || ""}
                />
              </label>

              <label htmlFor="number_phone">
                <span>Telephone number</span>
                <input
                  onChange={(e) => setNumber_phone(e.target.value.toString())}
                  type="text"
                  id="number_phone"
                  name="number_phone"
                  placeholder="+52 5512457800"
                  value={number_phone || ""}
                />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
