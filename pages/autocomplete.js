import React, { useEffect, useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Input, Button, Icon, Container, Segment } from "semantic-ui-react";
import styles from "./autocomplete.module.css";
import { useProgramState } from "@/hooks/useProgram";
import { useRouter } from "next/router";

const center = { lat: 19.511567494105133, lng: -99.12669760284929 };
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const geocodeJson = "https://maps.googleapis.com/maps/api/geocode/json";

export default function AutocompletePage() {
  const searchInput = useRef(null);
  const [address, setAddress] = useState({});
  const [markerPosition, setMarkerPosition] = useState(undefined);
  const router = useRouter();

  const { markets } = useProgramState();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  useEffect(() => {
    async function fetchData() {
      if (markets) {
        const response = UtilsMarket.getMarketInfoByHash(
          router.query.market?.toString(),
          markets
        );
        console.log(`data fetched`, response);
        setMarket(response);
      }
    }

    if (router.query.market) {
      fetchData();
    }
  }, [router.query.market, markets]);

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

    //si existe
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
      }

      if (types.includes("administrative_area_level_2")) {
        address.state = value;
      }

      if (types.includes("postal_code")) {
        address.zip = value;
      }
      if (types.includes("route")) {
        address.route = value;
      }
      if (types.includes("street_number")) {
        address.street_number = value;
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

  const findMyLocation = (reverseGeocode) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        reverseGeocode(position.coords);
      });
    }
  };

  const onMarkerDragEnd = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPosition = { lat, lng };

    setMarkerPosition(newPosition);
    //await reverseGeocode(newPosition);
    console.log(markerPosition);
  };

  useEffect(() => {
    if (isLoaded) {
      initAutocomplete(searchInput, setAddress, setMarkerPosition);
    }
  }, [isLoaded]);

  const reverseGeocode = ({ latitude: lat, longitude: lng }) => {
    const url = `${geocodeJson}?key=${apiKey}&latlng=${lat},${lng}`;
    searchInput.current.value = "Getting your location...";
    fetch(url)
      .then((response) => response.json())
      .then((location) => {
        const place = location.results[0];
        const _address = extractAddress(place);
        setAddress(_address);
        searchInput.current.value = _address.plain();
      });
  };

  if (address) console.log(address);

  if (!isLoaded) return <div>Loading...</div>;
  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  if (!isLoaded) return <div>Loading...</div>;
  if (loadError)
    return <div>Error loading Google Maps API: {loadError.message}</div>;

  return (
    <Container className={styles.App}>
      <Segment>
        <div className={styles.search}>
          <Input
            ref={(input) => (searchInput.current = input?.inputRef.current)}
            icon={<Icon name="search" />}
            placeholder="Search location..."
          />

          <Button onClick={() => findMyLocation(reverseGeocode)} icon>
            <Icon name="location arrow" />
          </Button>
        </div>
        <div className={styles.address}>
          <p>
            City: <span>{address.city}</span>
          </p>
          <p>
            State: <span>{address.state}</span>
          </p>
          <p>
            Zip: <span>{address.zip}</span>
          </p>
          <p>
            Street: <span>{address.route}</span>
          </p>
          <p>
            Number: <span>{address.street_number}</span>
          </p>
          <p>
            Country: <span>{address.country}</span>
          </p>
          {markerPosition ? (
            <>
              <p>Latitud: {markerPosition.lat}</p>
              <p>Longitud: {markerPosition.lng}</p>
            </>
          ) : (
            <></>
          )}
        </div>

        <div className={styles.map_container}>
          <GoogleMap
            defaultZoom={3}
            //si no se ha puesto una dirección, se redirige al centro que es
            center={markerPosition ? markerPosition : center}
            zoom={18}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
              zoomControl: false,
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
      </Segment>
    </Container>
  );
}
