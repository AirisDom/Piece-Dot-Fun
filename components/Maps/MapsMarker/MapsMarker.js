import { useEffect, useRef, useState } from "react";

import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import styles from "./MapsMarker.module.scss";

import { useRouter } from "next/router";
import Toast from "@/components/Toast/Toast";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export default function MapsMarker(props) {
  const router = useRouter();
  const { selectedAddress, markets } = props;
  const [loadingMarkers, setLoadingMarkers] = useState(true);

  const center = {
    lat: selectedAddress ? parseFloat(selectedAddress.lat) : 19.491567494105133,
    lng: selectedAddress
      ? parseFloat(selectedAddress.long)
      : -99.12669760284929,
  };

  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const valueText = `Haz click nuevamente para ir al restaurante`;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const googleMarkers = [];
    if (isLoaded && map) {
      for (let i = 0; i < markets.length; i++) {
        const currMarker = markets[i];

        const marker = new google.maps.Marker({
          position: { lat: currMarker.lat, lng: currMarker.lng },
          map,
          title: currMarker.title,
        });

        const infowindow = new google.maps.InfoWindow({
          content: currMarker.info,
        });

        marker.addListener("click", () => {
          router.replace(`/market/${currMarker.publicKey}`);
          activeInfoWindow?.close();
        });

        googleMarkers.push(marker);
      }

      setMarkers(googleMarkers);

      return () => {
        for (let marker of googleMarkers) {
          marker.setMap(null);
        }
      };
    }
  }, [markets]);

  if (!isLoaded) {
    return null;
  }

  const newMarker = new google.maps.Marker({
    position: { lat: center.lat, lng: center.lng },
    map,
    title: "Usuario",
  });

  return (
    <div className={styles.container}>
      <GoogleMap
        defaultZoom={3}
        center={newMarker.position}
        zoom={13.7}
        mapContainerStyle={{ width: "100%", height: "400px" }}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        }}
        onLoad={(map) => setMap(map)}
      >
        <Marker position={newMarker}></Marker>
      </GoogleMap>
      <Toast
        showToast={showToast}
        setShowToast={setShowToast}
        text={valueText}
      />
    </div>
  );
}
