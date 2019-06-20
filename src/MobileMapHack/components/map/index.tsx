import MapView, { Marker, Polyline, PROVIDER_GOOGLE} from "react-native-maps";
//import MapViewDirections from "react-native-maps-directions";
import {View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {MapData, LatLng} from "../../domain/types";
import {Button, Fab, Form, Icon, Input, Text, Card} from "native-base";
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

export const Map = (props) => {
    let origin: LatLng = props.navigation.getParam("origin");
    let dest: LatLng = props.navigation.getParam("destination");
    let maxLoc = {
        latitude: Math.max(origin.latitude, dest.latitude),
        longitude: Math.max(origin.longitude, dest.longitude)
    };
    let minLoc = {
        latitude: Math.min(origin.latitude, dest.latitude),
        longitude: Math.min(origin.longitude, dest.longitude)
    };
    let latDelta = maxLoc.latitude - minLoc.latitude;
    let lonDelta = maxLoc.longitude - minLoc.longitude;
    let centre = {latitude: minLoc.latitude + (0.5 * latDelta), longitude: minLoc.longitude + (0.5 * lonDelta)};

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
        console.log('Use effect in map')
        api<MapData>("http://spectrummapapi.azurewebsites.net/api/map/mobile")
            .then(data => {
                console.log("calling api");
                setMapData(data);
            });
    }, [showPollution, showSchools]);

    function maybeSearch() {
        if (showSearch) {
            return (
                <Card style={{zIndex: 1, right: 10, left: 10, position: 'absolute', flexDirection: "row"}}>
                    <Input placeholder="From" style={{flex: 1}}/>
                    <Input placeholder="From" style={{flex: 1}}/>
                    <Input placeholder="From" style={{flex: 1}}/>
                </Card>)
        } else {
            return null;
        }
    }

    return (
        <View style={{flex: 1}}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{flex: 1, zIndex: 0}}
                initialRegion={{
                    latitude: centre.latitude,
                    longitude: centre.longitude,
                    latitudeDelta: 1.05 * latDelta,
                    longitudeDelta: 1.05 * lonDelta
                }}
                onPress={() => toggleSearch(!showSearch)}
                onMapReady={() => mapRef.current.fitToElements(true)}
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
