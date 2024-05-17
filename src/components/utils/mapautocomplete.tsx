import React, { useEffect, useState, useCallback, FormEvent } from "react";
import {
  ControlPosition,
  MapControl,
  useMap,
  useMapsLibrary
} from "@vis.gl/react-google-maps";
import {
  Button,
  Container,
  Form,
  InputGroup,
  ListGroup
} from "react-bootstrap";
import { DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION } from "../../utils/constants";

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  origin: string;
}

export const GmapAutocomplete = ({
  onPlaceSelect,
  origin = DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
}: Props) => {
  const map = useMap();
  const places = useMapsLibrary("places");

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteSessionToken
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken>();

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);

  // https://developers.google.com/maps/documentation/javascript/reference/places-service
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  const [predictionResults, setPredictionResults] = useState<
    Array<google.maps.places.AutocompletePrediction>
  >([]);

  const [inputValue, setInputValue] = useState<string>("");
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!places || !map) return;

    setAutocompleteService(new places.AutocompleteService());
    setPlacesService(new places.PlacesService(map));
    setSessionToken(new places.AutocompleteSessionToken());

    return () => setAutocompleteService(null);
  }, [map, places]);

  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  const fetchPredictions = useCallback(
    async (inputValue: string) => {
      if (!autocompleteService || !inputValue) {
        setPredictionResults([]);
        return;
      }

      if (inputValue.length < 3) {
        setPredictionResults([]);
        return;
      }

      const request = {
        input: inputValue,
        sessionToken,
        componentRestrictions: { country: origin }
      };
      const response = await autocompleteService.getPlacePredictions(request);
      setPredictionResults(response.predictions);
    },
    [autocompleteService, sessionToken]
  );

  const onInputChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      const value = (event.target as HTMLInputElement)?.value;
      setInputValue(value);
      setTimerId(setTimeout(() => fetchPredictions(value), 300));
    },
    [fetchPredictions]
  );

  const handleSuggestionClick = useCallback(
    (placeId: string) => {
      if (!places) return;

      const detailRequestOptions = {
        placeId,
        fields: ["geometry", "name", "formatted_address"],
        sessionToken
      };

      const detailsRequestCallback = (
        placeDetails: google.maps.places.PlaceResult | null
      ) => {
        onPlaceSelect(placeDetails);
        setPredictionResults([]);
        setInputValue(placeDetails?.formatted_address ?? "");
        setSessionToken(new places.AutocompleteSessionToken());
      };

      placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
    },
    [onPlaceSelect, places, placesService, sessionToken]
  );

  return (
    <MapControl position={ControlPosition.INLINE_START_BLOCK_START}>
      <Container
        style={{
          width: "300px",
          marginTop: "10px"
        }}
      >
        <InputGroup>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setInputValue("");
              setPredictionResults([]);
            }}
          >
            🗑️
          </Button>
          <Form.Control
            type="text"
            placeholder="Search for a place"
            value={inputValue}
            onInput={(event: FormEvent<HTMLInputElement>) =>
              onInputChange(event)
            }
          />
        </InputGroup>
        {predictionResults.length > 0 && (
          <ListGroup as="ul">
            {predictionResults.map(({ place_id, description }) => {
              return (
                <ListGroup.Item
                  as="li"
                  action
                  key={place_id}
                  onClick={() => handleSuggestionClick(place_id)}
                >
                  {description}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Container>
    </MapControl>
  );
};
