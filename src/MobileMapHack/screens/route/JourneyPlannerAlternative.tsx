import React, {useEffect, useState, useContext} from 'react';
import {Card, CardItem, Content, Text, Body, View, Toast, Button, Icon, Spinner} from "native-base";
import {FlatList, StyleSheet} from 'react-native';
import {allJourneyParams, BusLeg, CycleLeg, JourneyAlternative, TubeLeg, WalkingLeg} from '../../domain/types';
import {api} from '../../api';
import JourneyContext from '../../context/JourneyContext';
import {fromNullable} from "fp-ts/lib/Option";

export const JourneyPlannerAlternative = () => {

    const {journeyPlannerParams, setJourneyPlannerParams} = useContext(JourneyContext);
    const [alternativeJourney, setAlternativeJourney] = useState<JourneyAlternative>(null);
    const [modeIndex, setModeIndex] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);

    const styles = StyleSheet.create({
        headerText: {
            fontWeight: '600'
        },
        content: {
            padding: 10,
        },
        detailItem: {
            padding: 5
        }
    });

    useEffect(() => {
        if (journeyPlannerParams != null) {
            // https://gladysint-insights-func.azurewebsites.net/api/JourneyOptions?code=Qa7a602gQhSdO8i4oCgAf5gv9flmxNUKCqyfa3rAakhwUOPiAuIkHw==&startDateTime=2019-10-04T10:00:00&startLongitude=${journeyPlannerParams.startLongitude}&startLatitude=${journeyPlannerParams.startLatitude}&endLongitude=${journeyPlannerParams.endLongitude}&endLatitude=${journeyPlannerParams.endLatitude}&mode=bus`;
            const url = `https://gladystest-insights-func.azurewebsites.net/api/JourneyOptions?code=JQRdUTTSpg10FHk0hHiBWloMsRcGZa1ErdcCtFd96uZ2vqzcI9jvug==&startDateTime=${new Date().toISOString()}&startLongitude=${journeyPlannerParams.startLongitude}&startLatitude=${journeyPlannerParams.startLatitude}&endLongitude=${journeyPlannerParams.endLongitude}&endLatitude=${journeyPlannerParams.endLatitude}&mode=${journeyPlannerParams.mode}`;
            console.log('Calling api at: ' + url);

            api<JourneyAlternative>(url)
                .then(data => {
                    console.log("*********** called api, setting journey planner data.");
                    console.log(data.legs);
                    setAlternativeJourney(data);
                    setLoading(false);
                })
                .catch(reason => {
                    console.log(`***********  error calling map api: ${reason}`);
                    // todo: toast does not show immediately
                    Toast.show({
                        text: "There was a problem getting the route details",
                        position: "bottom",
                        type: "warning"
                    });
                    setLoading(false);
                });
        }
    }, [journeyPlannerParams]);

    const renderBusLeg = (leg: BusLeg) => {
        return (<Card>
            <CardItem bordered>
                <Icon name="bus" style={{color: 'red'}}/>
                <Text style={styles.headerText}>Bus</Text>
            </CardItem>
            <CardItem style={{backgroundColor: '#eeeeee'}}>
                <Body>
                    <View>
                        <Text style={styles.detailItem}>Route: {leg.routeNumber}</Text>
                        <Text style={styles.detailItem}>Get on at : {leg.startPoint}</Text>
                        <Text style={styles.detailItem}>Get off at : {leg.finishPoint}</Text>
                    </View>
                </Body>
            </CardItem>
        </Card>);
    };

    const renderWalkingLeg = (leg: WalkingLeg) => {
        return (<Card>
            <CardItem bordered>
                <Icon name="walk" />
                <Text style={styles.headerText}>Walk</Text>
            </CardItem>
            <CardItem style={{backgroundColor: '#eeeeee'}}>
                <Body>
                    <View>
                        <Text style={styles.detailItem}>Instruction: {leg.details}</Text>
                        <Text style={styles.detailItem}>Distance: {leg.distance} m</Text>
                    </View>
                </Body>
            </CardItem>
        </Card>);
    };

    const renderCycleLeg = (leg: CycleLeg) => {
        return (<Card>
            <CardItem bordered>
                <Icon name="bicycle"  style={{color: 'green'}}/>
                <Text style={styles.headerText}>Cycle</Text>
            </CardItem>
            <CardItem style={{backgroundColor: '#eeeeee'}}>
                <Body>
                    <View>
                        <Text style={styles.detailItem}>From : {leg.startPoint}</Text>
                        <Text style={styles.detailItem}>To : {leg.arrivalPoint}</Text>
                        <Text style={styles.detailItem}>Distance: {leg.distance} m</Text>
                        <Text style={styles.detailItem}>Duration: {leg.duration} min</Text>
                    </View>
                </Body>
            </CardItem>
        </Card>);
    };

    const renderTubeLeg = (leg: TubeLeg) => {
        return (<Card>
            <CardItem bordered>
                <Icon name="train" style={{color: 'blue'}}/>
                <Text style={styles.headerText}>Tube</Text>
            </CardItem>
            <CardItem style={{backgroundColor: '#eeeeee'}}>
                <Body>
                    <View>
                        <Text style={styles.detailItem}>Route: {leg.routeName}</Text>
                        <Text style={styles.detailItem}>Get on at : {leg.startPoint}</Text>
                        <Text style={styles.detailItem}>Get off at : {leg.finishPoint}</Text>
                    </View>
                </Body>
            </CardItem>
        </Card>);
    };

    console.log("rendering");

    const modeSelected = index => {
        setJourneyPlannerParams(allJourneyParams[index]);
        setModeIndex(index);
        setAlternativeJourney(null);
        setLoading(true);
    };

    function getJourneyTitle() {
        const titles = ["Bus", "Tube", "Cycle"];
        return <Card><CardItem><Text>{titles[modeIndex]} Journey</Text></CardItem></Card>;
    }

    return (
        <Content style={styles.content}>
            <Card>
                <CardItem bordered style={{backgroundColor: 'red'}}>
                    <Text style={styles.headerText}>Journey Summary</Text>
                </CardItem>
                <CardItem style={{backgroundColor: '#eeeeee'}}>
                    <Body>
                        <View>
                            <Text style={styles.detailItem}>From: 24 Sutherland Square</Text>
                            <Text style={styles.detailItem}>To: 144 Queen Victoria St</Text>
                            <Text style={styles.detailItem}>Distance: 2.5 miles</Text>
                            <Text style={styles.detailItem}>Cost: £5.40</Text>
                            <Text style={styles.detailItem}>Duration: 18 min</Text>
                        </View>
                    </Body>
                </CardItem>
                <CardItem style={{justifyContent: 'center'}}>
                    <Text>Alternative Journey</Text>
                </CardItem>
                <CardItem style={{justifyContent: 'space-between'}}>
                    <Button iconLeft small bordered={modeIndex == 0} onPress={() => modeSelected(0)}
                            style={{backgroundColor: "lightgray"}}>
                        <Icon name='bus' style={{color: "red"}}/>
                        <Text>Bus</Text>
                    </Button>
                    <Button iconLeft small bordered={modeIndex == 1} onPress={() => modeSelected(1)}
                            style={{backgroundColor: "lightgray"}}>
                        <Icon name='train' style={{color: "blue"}}/>
                        <Text>Tube</Text>
                    </Button>
                    <Button iconLeft small bordered={modeIndex == 2} onPress={() => modeSelected(2)}
                            style={{backgroundColor: "lightgray"}}>
                        <Icon name='bicycle' style={{color: "green"}}/>
                        <Text>Cycle</Text>
                    </Button>
                </CardItem>
            </Card>
            {loading ? (<View style={{justifyContent: 'center', backgroundColor: "transparent"}}><Spinner /></View>) :
                alternativeJourney &&
                <FlatList
                    ListHeaderComponent={(() => getJourneyTitle())}
                    data={alternativeJourney.legs}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={datum =>
                        datum.item.mode == 'bus' ? renderBusLeg(datum.item as BusLeg)
                            : (datum.item.mode == 'walking' ? renderWalkingLeg(datum.item as WalkingLeg)
                            : (datum.item.mode == 'cycle' ? renderCycleLeg(datum.item as CycleLeg)
                            : (datum.item.mode == 'tube' ? renderTubeLeg(datum.item as TubeLeg)
                            : null)))}
                />}
        </Content>)

};
