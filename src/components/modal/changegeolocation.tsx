import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { set, ref } from "firebase/database";
import { useState, FormEvent, useCallback } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { database } from "../../firebase";
import { DEFAULT_COORDINATES, WIKI_CATEGORIES } from "../../utils/constants";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import errorHandler from "../../utils/helpers/errorhandler";
import HelpButton from "../navigation/help";
import { ConfigureAddressCoordinatesModalProps } from "../../utils/interface";
import { AdvancedMarker, Map, MapMouseEvent } from "@vis.gl/react-google-maps";
import { GmapAutocomplete } from "../utils/mapautocomplete";
import { ControlPanel } from "../utils/mapinfopanel";
import { MapCurrentTarget } from "../utils/mapcurrenttarget";

const ChangeAddressGeolocation = NiceModal.create(
  ({
    postalCode = "",
    congregation = "",
    coordinates = DEFAULT_COORDINATES.Singapore,
    origin,
    isNew = false
  }: ConfigureAddressCoordinatesModalProps) => {
    const [addressLocation, setAddressLocation] = useState(coordinates);
    const [currentLocation, setCurrentLocation] = useState(coordinates);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleUpdateGeoLocation = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        if (!isNew) {
          await pollingVoidFunction(() =>
            set(
              ref(
                database,
                `addresses/${congregation}/${postalCode}/coordinates`
              ),
              addressLocation
            )
          );
        }
        modal.resolve(addressLocation);
        modal.hide();
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        setIsSaving(false);
      }
    };
    const onMapClick = useCallback((event: MapMouseEvent) => {
      const eventDetails = event.detail;
      setAddressLocation({
        lat: eventDetails.latLng?.lat as number,
        lng: eventDetails.latLng?.lng as number
      });
    }, []);

    return (
      <Modal
        {...bootstrapDialog(modal)}
        fullscreen
        onHide={() => modal.remove()}
      >
        <Modal.Header>
          <Modal.Title>{isNew ? "Select" : "Change"} Location</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CHANGE_ADDRESS_NAME} />
        </Modal.Header>
        <Form onSubmit={handleUpdateGeoLocation}>
          <Modal.Body
            style={{
              height: window.innerHeight < 700 ? "75dvh" : "80dvh"
            }}
          >
            <Map
              mapId="change-address-geolocation"
              clickableIcons={false}
              center={{
                lat: currentLocation.lat,
                lng: currentLocation.lng
              }}
              onCenterChanged={(center) => {
                setCurrentLocation({
                  lat: center.detail.center.lat,
                  lng: center.detail.center.lng
                });
              }}
              defaultZoom={16}
              onClick={onMapClick}
              fullscreenControl={false}
              streetViewControl={false}
              gestureHandling="greedy"
            >
              <ControlPanel
                lat={addressLocation.lat}
                lng={addressLocation.lng}
              />
              <GmapAutocomplete
                origin={origin}
                onPlaceSelect={(place) => {
                  if (place && place.geometry && place.geometry.location) {
                    const location = place.geometry.location;
                    const locationLat = location.lat();
                    const locationLng = location.lng();
                    setAddressLocation({
                      lat: locationLat,
                      lng: locationLng
                    });
                    setCurrentLocation({
                      lat: locationLat,
                      lng: locationLng
                    });
                  }
                }}
              />
              <MapCurrentTarget
                onClick={() => {
                  setIsLocating(true);
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setIsLocating(false);
                    setAddressLocation({
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude
                    });

                    setCurrentLocation({
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude
                    });
                  });
                }}
                isLocating={isLocating}
              />
              <AdvancedMarker
                position={{
                  lat: addressLocation.lat,
                  lng: addressLocation.lng
                }}
              />
            </Map>
          </Modal.Body>
          <Modal.Footer className="justify-content-around">
            <Button variant="secondary" onClick={() => modal.hide()}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              {isSaving && (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    aria-hidden="true"
                  />{" "}
                </>
              )}
              {isNew ? "Select" : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
);

export default ChangeAddressGeolocation;
