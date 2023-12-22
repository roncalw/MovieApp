import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Button, Platform, Alert, Modal, TouchableWithoutFeedback, Dimensions  } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/MainNavigation';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { movieType } from './Home';
import { searchMovieTV } from '../services/MovieServices';
import Card from '../../components/Card';
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from '@react-native-community/datetimepicker';




const SearchByDate = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const _renderItem: React.FC<{ item: movieType; }> = ({ item }) => {
        return (
            <Card navigation={navigation} item={item} />
        );
    };

    const [text, onChangeText] = useState('');
    const [searchResults, setSearchResults] = useState<movieType[]>([]);

    function onSubmit(query: string) {
        Promise.all(
        [searchMovieTV(query, 'movie'), searchMovieTV(query, 'tv') ]
        
        )
        .then(([movies, tv]) => {
            const data:movieType[] = [...movies, ...tv];
            setSearchResults(data);
        });
    }


    const [selectedDateEnd, setSelectedDateEnd] = useState<Date | null>(null);
    const [showDatePickerEnd, setShowDatePickerEnd] = useState(false);

    const [selectedDateBegin, setSelectedDateBegin] = useState<Date | null>(null);
    const [showDatePickerBegin, setShowDatePickerBegin] = useState(false);
  
    const handleDateChangeBegin = (_: Event, date?: Date) => {
      if (date) {
        setSelectedDateBegin(date);
        //setTimeout(() => {
          //setShowDatePickerBegin(false); // Close the DatePicker after 2 seconds
        //}, 5000);
      }
    };
  
    const handleDateChangeEnd = (_: Event, date?: Date) => {
      if (date) {
        setSelectedDateEnd(date);
        //setTimeout(() => {
          //setShowDatePickerEnd(false); // Close the DatePicker after 2 seconds
        //}, 5000);
      }
    };
  
    const openDatePickerBegin = () => {
      setShowDatePickerBegin(true); // Open DatePicker
    };
  
    const closeDatePickerBegin = () => {
      setShowDatePickerBegin(false);
    };
  
    const openDatePickerEnd = () => {
      setShowDatePickerEnd(true); // Open DatePicker
    };
  
    const closeDatePickerEnd = () => {
      setShowDatePickerEnd(false);
    };
  
  
  
    return (
        <SafeAreaView style={{flexDirection: 'column'}}>
            <View style={{height: '5%', borderWidth: 0, borderColor: 'blue', marginBottom: 70, marginTop: -15}}>
                <Navbar navigation={navigation} mainBool={true}/>  
            </View>

            <View style={{height: '12%', borderWidth: 0, borderColor: 'green', padding: 0, marginTop: -15}}>

                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>

                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '50%' }}>

                        <TouchableOpacity onPress={openDatePickerBegin}>
                          <Text>Select Date</Text>
                        </TouchableOpacity>

                        <Modal
                          transparent={true}
                          visible={showDatePickerBegin}
                          onRequestClose={closeDatePickerBegin}
                          animationType="fade"
                          style={{}}
                        >
                            <TouchableWithoutFeedback onPress={closeDatePickerBegin}>

                              <View style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: '#771F14', marginTop: 150, borderRadius: 30, backgroundColor: 'rgba(251, 235, 202, 0.999)', borderStartWidth: 3, borderEndWidth: 7, borderTopWidth: 1, borderBottomWidth: 5}}>

                                  <DateTimePicker
                                    value={selectedDateBegin || new Date()}
                                    mode="date"
                                    onChange={handleDateChangeBegin}
                                    display="spinner"
                                    textColor="#000000"
                                    style={{borderWidth: 0, borderRadius: 0, height: 200, }}
                                    minimumDate={new Date(1960, 11, 31)} // Set the maximum date (December 31, 2024)
                                    maximumDate={new Date(2024, 11, 31)} // Set the maximum date (December 31, 2024)
                                  />

                              </View>

                            </TouchableWithoutFeedback>

                            <TouchableOpacity onPress={closeDatePickerBegin}>
                              <Text style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>Close</Text>
                            </TouchableOpacity>

                        </Modal>

                        {selectedDateBegin && <Text>{selectedDateBegin.toDateString()}</Text>}
                    </View>

                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '50%' }}>
                     
                        <TouchableOpacity onPress={openDatePickerEnd}>
                          <Text>Select Date</Text>
                        </TouchableOpacity>

                        <Modal
                          transparent={true}
                          visible={showDatePickerEnd}
                          onRequestClose={closeDatePickerEnd}
                          animationType="fade"
                          style={{}}
                        >
                            <TouchableWithoutFeedback onPress={closeDatePickerEnd}>

                              <View style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: '#771F14', marginTop: 150, borderRadius: 30, backgroundColor: 'rgba(251, 235, 202, 0.999)', borderStartWidth: 3, borderEndWidth: 7, borderTopWidth: 1, borderBottomWidth: 5}}>

                                  <DateTimePicker
                                    value={selectedDateEnd || new Date()}
                                    mode="date"
                                    onChange={handleDateChangeEnd}
                                    display="spinner"
                                    textColor="#000000"
                                    style={{borderWidth: 0, borderRadius: 0, height: 200, }}
                                    minimumDate={new Date(1960, 11, 31)} // Set the maximum date (December 31, 2024)
                                    maximumDate={new Date(2024, 11, 31)} // Set the maximum date (December 31, 2024)
                                  />

                              </View>

                            </TouchableWithoutFeedback>

                            <TouchableOpacity onPress={closeDatePickerEnd}>
                              <Text style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>Close</Text>
                            </TouchableOpacity>

                        </Modal>

                        {selectedDateEnd && <Text>{selectedDateEnd.toDateString()}</Text>}
                    </View>

                </View>


            </View>

            <View style={{height: '8%', borderWidth: 0, borderColor: 'red'}}>
                <View style={styles.container}>
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder={'Search Movie or TV'}
                            onChangeText={onChangeText}
                            value={text} />
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            onSubmit(text);
                        } }>
                        <Icon name={'search-outline'} size={30} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{height: '75%', borderWidth: 0, borderColor: 'purple'}}>
                <View style={styles.searchItems}>
                    <FlatList
                        numColumns={3}
                        data={searchResults}
                        renderItem={_renderItem} />
                </View>
            </View>


        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    form: {
        flexBasis: 'auto',
        flexGrow: 1,
        paddingRight: 8,
    },
    input: {
        borderRadius: 15,
        borderWidth: 0.5,
        height: 50,
        padding: 8
    },
    container: {
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    searchItems: {
        padding: 8,
    },
    datePicker: {
      color: '#333',
    }
  });

export default SearchByDate;