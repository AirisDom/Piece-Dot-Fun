import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useRef, useState } from "react";
/*global google*/
let center = { lat: 19.511567494105133, lng: -99.12669760284929 };

export default function NavigationRoutes() {
  const [coorLat, setCoorLat] = useState(0.0);
  const [coorLong, setCoorLong] = useState(0.0);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBQvEWokU2Jw5SDAnkt-s42jHnIK1b5R1k",
    libraries: ["places"],
  });

  const [map, setMap] = useState(/** @type */ (null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  /**@type */
  const originRef = useRef();
  /**@type */

  const destinationRef = useRef();

  const markers = [
    ["Restaurante 1", 19.491567494105133, -99.12669760284929],
    ["Restaurante 2", 19.496210884319055, -99.13510121632883],
    ["Restaurante 3", 19.490293773098887, -99.11156284912232],
    ["Restaurante 4", 19.473914927449062, -99.11470129807255],
    ["Restaurante 5", 19.468948111551795, -99.1286001434235],
  ];

  if (!isLoaded) {
    return null;
  }

  async function calculateRoute(coorLat, coorLong, center) {
    let dest = { lat: coorLat, lng: coorLong };
    let ori = { lat: 19.511567494105133, lng: -99.12669760284929 };

    if (!ori) {
      console.log(ori, "no definido");
      return;
    } else {
      console.log("calculando");
    }

    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: ori,
      destination: dest,
      travelMode: google.maps.TravelMode.WALKING,
    });

    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  }

  for (let i = 0; i < markers.length; i++) {
    const currMarker = markers[i];
    const marker = new google.maps.Marker({
      position: { lat: currMarker[1], lng: currMarker[2] },
      map,
      title: currMarker[0],
    });
    const infowindow = new google.maps.InfoWindow({
      content: currMarker[0],
    });

    marker.addListener("click", () => {
      if (activeInfoWindow) {
        activeInfoWindow.close();
      }
      infowindow.open(map, marker);
      setActiveInfoWindow(infowindow);
      setCoorLat(currMarker[1]);
      setCoorLong(currMarker[2]);
    });

    marker.addListener("c");
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
  }

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        <GoogleMap
          defaultZoom={3}
          center={center}
          zoom={18}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            clickableIcons: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          <Marker position={center}></Marker>
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <HStack spacing={4}>
          <ButtonGroup>
            <Button
              colorScheme="pink"
              type="submit"
              onClick={() => {
                if (coorLat != 0 && coorLat != undefined) {
                  calculateRoute(coorLat, coorLong);
                } else alert("Selecciona un restaurante");
              }}
            >
              Calculate Route
            </Button>
            <IconButton
              aria-label="center back"
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <Text>Distance: {distance}</Text>
          <Text>Duration: {duration}</Text>
          <IconButton
            aria-label="center back"
            icon={<FaLocationArrow />}
            isRound
            onClick={() => map.panTo(center)}
          />
        </HStack>
      </Box>
    </Flex>
  );
}
