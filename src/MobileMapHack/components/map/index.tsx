import MapView, { Marker, Polyline, PROVIDER_GOOGLE} from "react-native-maps";
//import MapViewDirections from "react-native-maps-directions";
import {View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {MapData, LatLng, Journey} from "../../domain/types";
import {Button, Fab, Icon, Input, Card} from "native-base";
// @ts-ignore
import StartImg from "../../assets/start.png"
// @ts-ignore
import FinishImg from "../../assets/finish.png"
// @ts-ignore
import SchoolImg from "../../assets/school.png"
// @ts-ignore
import OneImg from "../../assets/one.png"
// @ts-ignore
import TwoImg from "../../assets/two.png"
// @ts-ignore
import ThreeImg from "../../assets/three.png"
// @ts-ignore
import FourImg from "../../assets/four.png"

const GOOGLE_MAPS_APIKEY = '';

function calculateMapRegion(journey: Journey): { centre:LatLng, size: {latDelta: number, lonDelta: number}} {
    let maxLoc = {
        latitude: Math.max(journey.start.latitude, journey.end.latitude),
        longitude: Math.max(journey.start.longitude, journey.end.longitude)
    };
    let minLoc = {
        latitude: Math.min(journey.start.latitude, journey.end.latitude),
        longitude: Math.min(journey.start.longitude, journey.end.longitude)
    };
    let latDelta = maxLoc.latitude - minLoc.latitude;
    let lonDelta = maxLoc.longitude - minLoc.longitude;
    let centre = {latitude: minLoc.latitude + (0.5 * latDelta), longitude: minLoc.longitude + (0.5 * lonDelta)};
    return { centre, size: {latDelta, lonDelta} };
}

export const Map = (props) => {
    let journey: Journey | null = props.navigation.getParam("journey");

    // should maybe based on map feature extents
    let region = journey
        ? calculateMapRegion(journey)
        :  {centre: {latitude: 51.509864, longitude: -0.118092}, size: {latDelta: 0.0922, lonDelta: 0.0421}};

    const [fabActive, setFabActive] = useState(() => false);
    const [showPollution, togglePollution] = useState(() => true);
    const [showSchools, toggleSchools] = useState(() => true);
    const [mapData, setMapData] = useState<MapData>();
    const mapRef = useRef<MapView>();
    const [showSearch, toggleSearch] = useState(() => false);

    function api<T>(url: string): Promise<T> {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json() as Promise<T>
            })
    }

    const imgs = {
        "start": StartImg,
        "finish": FinishImg,
        "school": SchoolImg,
        "one": OneImg,
        "two": TwoImg,
        "three": ThreeImg,
        "four": FourImg
    };

    useEffect(() => {
        if (journey != null) {
            api<MapData>("http://10.0.2.2:5000/api/map/mobile")
                .then(data => {
                    console.log("*********** calling api");
                    setMapData(data);
                });
        }
    }, [showPollution, showSchools]);

    function maybeSearch() {
        if (showSearch) {
            return (
                <Card style={{zIndex: 1, right: 10, left: 10, position: 'absolute'}}>
                    <Input placeholder="From" style={{flex: 1}}/>
                    <Input placeholder="From" style={{flex: 1}}/>
                    <Input placeholder="From" style={{flex: 1}}/>
                </Card>)
        } else {
            return null;
        }
    }

    console.log("*********** rendering");
    return (
        <View style={{flex: 1}}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{flex: 1, zIndex: 0}}
                initialRegion={{
                    latitude: region.centre.latitude,
                    longitude: region.centre.longitude,
                    latitudeDelta: 1.05 * region.size.latDelta,
                    longitudeDelta: 1.05 * region.size.lonDelta
                }}
                onPress={() => toggleSearch(!showSearch)}
                onMapReady={() => {
                    console.log("*********** fitting elements");
                    // does not currently run as the elements are loaded afterwards
                    // left here as example
                    mapRef.current.fitToElements(true);
                }}
            >
                {mapData && mapData.lines.map((line, index) =>
                    <Polyline
                        key={"line" + index}
                        coordinates={line.coordinates}
                        strokeWidth={line.strokeWidth}
                        strokeColor={line.strokeColor}
                    />
                )}
                {mapData && mapData.markers.map((marker, index) =>
                    <Marker
                        key={"marker" + index}
                        title={marker.title}
                        image={imgs[marker.image]}
                        coordinate={marker.coordinates}
                    />
                )}
            </MapView>
            {maybeSearch()}
            <Fab
                direction="up"
                position="bottomRight"
                active={fabActive}
                onPress={() => setFabActive(!fabActive)}>
                <Icon name="playlist-add-check" type="MaterialIcons"/>
                <Button
                    onPress={() => togglePollution(!showPollution)}
                    style={{backgroundColor: showPollution ? "#B5651D" : "#CCCCCC"}}>
                    <Icon name="cloud-circle" type="MaterialIcons"/>
                </Button>
                <Button
                    onPress={() => toggleSchools(!showSchools)}
                    style={{backgroundColor: showSchools ? "#397D02" : "#CCCCCC"}}>
                    <Icon name="school" type="MaterialIcons"/>
                </Button>
            </Fab>
        </View>)
};
