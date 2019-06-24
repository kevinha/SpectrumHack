import React, {useContext, useEffect, useState} from "react";
import {Animated} from "react-native";
import {Button, Card, CardItem, Icon, Input, Label, Picker} from "native-base";
import {Journey} from "../../domain/types";
import {fromNullable} from "fp-ts/lib/Option";
import JourneyContext from "../../context/JourneyContext";

export const SearchPanel = (props:{show:boolean, journey:Journey | null}) => {

    const {show} = props;
    const [visible, setVisible] = useState(false);
    const [time, setTime] = useState("08:00");
    const {setStartTime} = useContext(JourneyContext);

    const showTop = 10;
    const hideTop = -290;
    let hidingTop = new Animated.Value(hideTop);
    let showingTop = new Animated.Value(showTop);
    let top = (visible ? showingTop : hidingTop);

    useEffect(() => {
        if (show == true && visible === false) {
            Animated.timing(
                hidingTop,
                {
                    toValue: showTop,
                    duration: 500,
                }
            ).start(() => setVisible(true));
        }
        else if (visible === true && show === false)
        {
            Animated.timing(
                showingTop,
                {
                    toValue: hideTop,
                    duration: 500,
                }
            ).start(() => setVisible(false));
        }
    });

    const journeyDetails = fromNullable(props.journey)
        .map(j => ({startName: j.startName, endName: j.endName, startTime: j.startTime}))
        .getOrElse({startName: "", endName: "", startTime: "08:00"});
    const range = new Array(47).fill(0);
    return (
        <Animated.View style={{top: top, position: 'absolute', right: 10, left: 10}}>
            <Card style={{borderRadius: 5}}>
                <CardItem>
                    <Input placeholder="From" style={{flex: 4, borderWidth: 1, borderRadius: 5, borderColor: "#CCCCCC"}}>{journeyDetails.startName}</Input>
                </CardItem>
                <CardItem>
                    <Input placeholder="To" style={{flex: 4, borderWidth: 1, borderRadius: 5, borderColor: "#CCCCCC"}}>{journeyDetails.endName}</Input>
                </CardItem>
                <CardItem>
                    <Label style={{marginRight: 5}}>Time</Label>
                    <Picker
                        mode="dropdown"
                        onValueChange={(value) => setTime(value)}
                        selectedValue={time}
                    >
                        {range.map((_, index) => {
                            const hour = Math.floor(index / 2);
                            const mins = index % 2 == 0 ? "00" : "30";
                            const timeOption = `${hour < 10 ? "0" + hour : hour.toString()}:${mins}`;
                            return (<Picker.Item label={timeOption} value={timeOption} key={timeOption}/>);
                        })}
                    </Picker>
                    <Button primary style={{width:50, height:50, borderRadius:25, alignItems:"center", justifyContent:"center"}}
                        onPress={() => setStartTime(time)}>
                        <Icon name="search" type="MaterialIcons" />
                    </Button>
                </CardItem>
            </Card>
        </Animated.View>
    )
};
