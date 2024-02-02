import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Button, Platform, Alert, Modal, TouchableWithoutFeedback, Dimensions, useWindowDimensions, ListRenderItem  } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from '../../components/Navbar'
import { useIsFocused, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/MainNavigation';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { movieType } from './Home';
import { getMoviesByDate, searchMovieTV } from '../services/MovieServices';
import Card from '../../components/Card';
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';


type SearchByDateParamList = {
  SearchByDate: { directNavigation?: boolean };
};

type SearchByDateRouteProp = RouteProp<SearchByDateParamList, 'SearchByDate'>;


const SearchByDate = () => {

  //=========================================================================    NAVIGATION SETUP    =========================================================================


    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [directNavigation, setDirectNavigation] = useState(false);

    //================================================================    SEARCH RESULTS FOR EACH ITEM IN FLAT LIST    =========================================================================


    const _renderItem: ListRenderItem<movieType> = ({ item }) => {
        return (
            <Card navigation={navigation} item={item} />
        );
    };

    const [text, onChangeText] = useState('');
    const [searchResults, setSearchResults] = useState<movieType[]>([]);

    //=========================================================================    GENRE PICKER    =========================================================================

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    const pickerRef = useRef<any>(null);

  
    const openPicker = () => {
      setModalVisible(true);
    };
  
    const closePicker = () => {
      setModalVisible(false);
    };
  
    const items = [
      { label: 'Action', value: '28' },
      { label: 'Adventure', value: '12' },
      { label: 'Animation', value: '16' },
      { label: 'Comedy', value: '35' },
      { label: 'Crime', value: '80' },
      { label: 'Documentary', value: '99' },
      { label: 'Drama', value: '18' },
      { label: 'Family', value: '10751' },
      { label: 'Fantasy', value: '14' },
      { label: 'History', value: '36' },
      { label: 'Horror', value: '27' },
      { label: 'Music', value: '10402' },
      { label: 'Mystery', value: '9648' },
      { label: 'Romance', value: '10749' },
      { label: 'SciFi', value: '878' },
      { label: 'Thriller', value: '53' },
      { label: 'War', value: '10752' },
      { label: 'Western', value: '37' },
    ];

    useEffect(() => {
      if (!modalVisible) {
        //setSelectedItems([]); // Reset selected items when the modal is closed
      }
    }, [modalVisible]);


    const handleItemSelected = (itemValue: string, itemLabel: string) => {
      //console.log('Genre change made');
      setSearchResults([]);
      setPage(1);

      const isSelected = selectedItems.includes(itemValue);

      if (isSelected) {
        setSelectedItems(prevSelectedItems =>
          prevSelectedItems.filter(item => item !== itemValue)
        );
        setSelectedLabels(prevSelectedLabels =>
          prevSelectedLabels.filter(label => label !== itemLabel)
        );
      } else {
        setSelectedItems(prevSelectedItems => [...prevSelectedItems, itemValue]);
        setSelectedLabels(prevSelectedLabels => [...prevSelectedLabels, itemLabel]);
      }
    };
  
    const isItemSelected = (itemValue: string) => {
      return selectedItems.includes(itemValue);
    };
    
   // useEffect(() => {
  //    console.log(`from selected items: ${selectedItems}`); // Log the updated selectedItems immediately after state update
 //   }, [selectedItems]);

    useEffect(() => {
      //console.log(`from selected labels: ${selectedLabels}`); // Log the updated selectedItems immediately after state update
    }, [selectedLabels]);

    //For the query to the database
    const myArray = selectedItems;
    let genreString: string = myArray.join("|");

    //For the display
    const separatedStrings = selectedLabels.map((str, index) => (
      <Text key={index}>{str}</Text>
    ));

    //=========================================================================   RATINGS PICKER - BEGIN    =========================================================================

    const [showRatingsPicker, setShowRatingsPicker] = useState(false);


    type movieRating = {
      id: string;
      label: string;
      isChecked: boolean;
  }

    const [ratings, setRatings] = useState<movieRating[]>([
      { id: 'G', label: 'G', isChecked: false },
      { id: 'PG', label: 'PG', isChecked: false },
      { id: 'PG-13', label: 'PG-13', isChecked: false },
      { id: 'R', label: 'R', isChecked: false },
    ]);

    const handleRatingChange = (id: string) => {
      //console.log('Ratings change made');
      setSearchResults([]);
      setPage(1);

      const updatedRatings = ratings.map((rating) =>
        rating.id === id ? { ...rating, isChecked: !rating.isChecked } : rating
      );
      setRatings(updatedRatings);
    };

    const selectedRatings = ratings.filter((rating) => rating.isChecked);


    const openShowRatingsPicker = () => {
      setShowRatingsPicker(true); // Open DatePicker
    };
  
    const closeShowRatingsPicker = () => {
      setShowRatingsPicker(false);
    };

    //For the query to the database
    const ratingsAsString: string = selectedRatings.map(item => item.label).join('|');

    //For the display
    const ratingsAsStringDisplay: string = selectedRatings.map(item => item.label).join(' | ');

    //=========================================================================    SUBMIT    ================================================================================


    function onSubmit(caller: string, ratings: string, beginDate: string, endDate: string, movieGenres: string, pageNum: number) {
      //console.log(beginDate);
      //console.log(endDate);
      //console.log(pageNum);
      //console.log(caller);

        if (caller === 'submit') {
            setSearchResults([]);
            setPage(1);
          };

        Promise.all(
        [getMoviesByDate(ratingsAsString, beginDate, endDate, movieGenres, pageNum) ]
        
        )
        .then(([movies]) => {
            const data:movieType[] = [...movies];
            setSearchResults(
              
              prevResults => [...prevResults, ...data]
              );
        });

    };

    //=========================================================================    LOAD MORE    =========================================================================


    const [page, setPage] = useState(1); // Current page

    const loadMore = () => {
      //console.log('Load More')

      const nextPage = page + 1; // Increment the page for the next fetch
      setPage(nextPage);

      onSubmit('loadMore', ratingsAsString, queryDateBegin, queryDateEnd, genreString, nextPage)
    };

        
//=========================================================================    RESETTING    ============================================================================



    const isFocused = useIsFocused();
    const route = useRoute<SearchByDateRouteProp>();


    const resetSearchResults = () => {
      setSelectedDateBegin(previousYearDate);
      setSelectedDateEnd(new Date());
      setSelectedItems([]);
      setSelectedLabels([]);
      setSearchResults([]);
      setPage(1);
      setRatings([
        { id: 'G', label: 'G', isChecked: false },
        { id: 'PG', label: 'PG', isChecked: false },
        { id: 'PG-13', label: 'PG-13', isChecked: false },
        { id: 'R', label: 'R', isChecked: false },]);
      closePicker();
    };

    // Function to perform actions when the component gains focus
    // useFocusEffect(
    //   React.useCallback(() => {
    //     // Resetting searchResults to null when the component gains focus
    //     resetSearchResults();

    //     return () => {
    //       // Perform any cleanup or additional actions when the component loses focus
    //     };
    //   }, [])
    // );

    useEffect(() => {
      if (route.params?.directNavigation) {
        setDirectNavigation(true);
      }
    }, [route.params]);

    useEffect(() => {
      if (isFocused && directNavigation) {
        resetSearchResults();
        setDirectNavigation(false);
      }
    }, [isFocused, directNavigation]);
  

//=========================================================================    DATE - PREVIOUS YEAR ON 1/1    =========================================================================



    const getPreviousYearDate = () => {
      const currentDate = new Date(); // Get current date
      const currentYear = currentDate.getFullYear(); // Get current year
      const previousYearDate = new Date(currentYear - 5, 0, 1); // January 1st of the previous year
      return previousYearDate; // Return date object for January 1st of the previous year
    };
  
    const previousYearDate = getPreviousYearDate();

    //console.log(previousYearDate);

//=========================================================================    BEGIN DATE - BEGIN DATE CODE    =========================================================================

    const [selectedDateBegin, setSelectedDateBegin] = useState<Date | null>(previousYearDate);
    const [showDatePickerBegin, setShowDatePickerBegin] = useState(false);

    const queryDateBegin: string  = selectedDateBegin ? selectedDateBegin.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

    let formattedDateBegin = '';

    if (selectedDateBegin instanceof Date) {
      formattedDateBegin = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(selectedDateBegin);
    }

  
    const handleDateChangeBegin = (event: DateTimePickerEvent, date?: Date) => {
      //console.log('Begin Date change made');
      setSearchResults([]);
      setPage(1);

      if (date) {
        setSelectedDateBegin(date);
        //setTimeout(() => {
          //setShowDatePickerBegin(false); // Close the DatePicker after 2 seconds
        //}, 5000);
      }
    };
  
    const openDatePickerBegin = () => {
      setShowDatePickerBegin(true); // Open DatePicker
    };
  
    const closeDatePickerBegin = () => {
      setShowDatePickerBegin(false);
    };

    //=========================================================================  END DATE - END DATE CODE    =========================================================================

    const [selectedDateEnd, setSelectedDateEnd] = useState<Date | null>(new Date());
    const [showDatePickerEnd, setShowDatePickerEnd] = useState(false);

    const queryDateEnd: string  = selectedDateEnd ? selectedDateEnd.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    
    let formattedDateEnd = '';

    if (selectedDateEnd instanceof Date) {
      formattedDateEnd = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(selectedDateEnd);
    }
  
    const handleDateChangeEnd = (event: DateTimePickerEvent, date?: Date) => {
      //console.log('End Date change made');
      setSearchResults([]);
      setPage(1);

      if (date) {
        setSelectedDateEnd(date);
        //setTimeout(() => {
          //setShowDatePickerEnd(false); // Close the DatePicker after 2 seconds
        //}, 5000);
      }
    };
  
    const openDatePickerEnd = () => {
      setShowDatePickerEnd(true); // Open DatePicker
    };
  
    const closeDatePickerEnd = () => {
      setShowDatePickerEnd(false);
    };

    const Separator = () => {
        return <View style={{height: 5, backgroundColor: 'transparent'}} />;
      };
  
    return (
        <SafeAreaView style={{flexDirection: 'column'}}>

{/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}

{/* ===============================================================================================================================================================================================
============================================================================  ROW 1 --- 5% Height !!! NAVBAR !!! ================================================================
===================================================================================================================================================================================================  */}

{/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}


            <View style={{flex: 1, flexDirection: 'row', height: '5%', borderWidth: 0, borderColor: 'blue', marginBottom: 75, marginTop: -15}}>
                <View style={{width:'90%', borderWidth: 0, borderColor: 'red', }}>
                  <Navbar navigation={navigation} page={'sbd'}/>
                </View>
                <View style={{width:'10%', height: 100,}}>
                  <TouchableOpacity
                    onPress={() => {
                        onSubmit('submit', ratingsAsString, queryDateBegin, queryDateEnd, genreString, page);
                    }}
                    style={{marginTop: 45, marginLeft: -20}}>
                    <Icon name={'search-outline'} size={30} />
                  </TouchableOpacity>
                </View>
            </View>

{/* ======================================================================================  THE DATE BUTTONS !!!  ======================================================    */}

{/* ==========================================================================  ROW 2 --- 12% Height  !!!  THE DATE BUTTONS !!!  ======================================================    */}

{/* ======================================================================================  THE DATE BUTTONS !!!  ======================================================    */}



            <View style={{height: '8%', borderWidth: 0, borderColor: 'green', padding: 0, marginTop: 25}}>

                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 0, marginTop: 0}}>

    {/* COLUMN 1 --- 50% Width */}

    {/* ======================================================================================  !!! FROM DATE !!!  ===============================================================    */}


                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '50%', borderWidth: 0, paddingLeft: 0, paddingRight: 0, marginTop: -5 }}>

                {/* BUTTON TO POPUP BEGIN DATE */}
                        <Text style={{marginBottom: -5, marginTop: 10}}>From</Text>
                        <TouchableOpacity onPress={openDatePickerBegin} style={{height: 40, width:120, justifyContent: 'center', alignItems: 'center', backgroundColor: "#F8EBCE", borderRadius: 10, padding: 10, margin: 10, borderColor: '#771F14', borderStartWidth: 2, borderEndWidth: 3, borderTopWidth: 1, borderBottomWidth: 2.5}}>
                          {selectedDateBegin && <Text>{formattedDateBegin}</Text>}
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

                {/* DATEPICKER BEGIN DATE */}

                                  <DateTimePicker
                                    value={selectedDateBegin || new Date()}
                                    mode="date"
                                    onChange={handleDateChangeBegin}
                                    display="spinner"
                                    textColor="#000000"
                                    style={{borderWidth: 0, borderRadius: 0, height: 200, }}
                                    minimumDate={new Date(1960, 11, 31)} // Set the minimum date (December 31, 1960)
                                    maximumDate={new Date(2024, 11, 31)} // Set the maximum date (December 31, 2024)
                                  />

                              </View>

                            </TouchableWithoutFeedback>

                {/* BUTTON TO CLOSE BEGIN DATE */}

                              {/* BUTTON TO CLOSE GENRE PICKER */}
                              <TouchableOpacity onPress={closeDatePickerBegin} style={{alignSelf: 'center', height: 40, width: 120, backgroundColor: "#F8EBCE", borderRadius: 10, padding: 10, margin: 10, borderColor: '#771F14', borderStartWidth: 2, borderEndWidth: 3, borderTopWidth: 1, borderBottomWidth: 2.5}}>
                                <Text style={{alignSelf: 'center', }}>Close</Text>
                              </TouchableOpacity>


                        </Modal>

                        
                    </View>

    {/* COLUMN 2 --- 50% Width */}

        {/* ======================================================================================  !!! TO DATE !!!  ===============================================================    */}


                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '50%', borderWidth: 0, marginTop: -5 }}>

                {/* BUTTON TO POPUP END DATE */}
                        <Text style={{marginBottom: -5, marginTop: 10}}>To</Text>
                     
                        <TouchableOpacity onPress={openDatePickerEnd} style={{height: 40, width: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: "#F8EBCE", borderRadius: 10, padding: 10, margin: 10, borderColor: '#771F14', borderStartWidth: 2, borderEndWidth: 3, borderTopWidth: 1, borderBottomWidth: 2.5}}>
                          {selectedDateEnd && <Text>{formattedDateEnd}</Text>}
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
                
                {/* DATEPICKER END DATE */}

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

                {/* BUTTON TO CLOSE END DATE */}

                              {/* BUTTON TO CLOSE GENRE PICKER */}
                              <TouchableOpacity onPress={closeDatePickerEnd} style={{alignSelf: 'center', height: 40, width: 120, backgroundColor: "#F8EBCE", borderRadius: 10, padding: 10, margin: 10, borderColor: '#771F14', borderStartWidth: 2, borderEndWidth: 3, borderTopWidth: 1, borderBottomWidth: 2.5}}>
                                <Text style={{alignSelf: 'center', }}>Close</Text>
                              </TouchableOpacity>



                        </Modal>

                    </View>

                </View>


            </View>

{/* ========================================================================  GENRES AND MOVIE RATINGS !!!  ===============================================================    */}

{/* ========================================================================  ROW 3 --- 8% Height   !!!  GENRES AND MOVIE RATINGS !!!  ======================================================    */}

{/* ========================================================================  GENRES AND MOVIE RATINGS !!!  ===============================================================    */}



              {/* ============================================================     GENRES    !!!   GENRES      GENRES      !!!  ======================================================    */}


            <View style={{flexDirection: 'row', height: '8%', borderWidth: 0, borderColor: 'red', marginTop: 15}}>
                <View style={{width: '50%', flexDirection: 'row', borderWidth: 0, borderColor: 'blue', }}>
                    <View style={{justifyContent: 'center', alignItems: 'center', borderWidth: 0, width: '100%',}}>

                            <TouchableOpacity onPress={openPicker} style={{ padding: 10, height: 45, marginBottom: 0}}>
                              <Text style={{ color: '#771F14', textAlign: 'center', fontSize: 20 }}>Choose Genre(s)</Text>
                            </TouchableOpacity>

                            <Modal
                              transparent={true}
                              visible={modalVisible}
                              animationType="fade"
                              style={{}}
                            >

                                <View style={{height: 200, width: 400, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: '#771F14', marginTop: 150, borderRadius: 30, backgroundColor: 'rgba(251, 235, 202, 0.999)', borderStartWidth: 3, borderEndWidth: 7, borderTopWidth: 1, borderBottomWidth: 5}}>
                        

                                    <View style={{ borderRadius: 25, margin: 5, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'white', padding: 5, justifyContent: 'center', alignItems: 'center', }}>


                                          {items.map((item, index) => (

                                              <View style={{ backgroundColor: 'white', margin: .5}} key={index}>
                                                  <TouchableOpacity
                                                    key={index}
                                                    onPress={() => handleItemSelected(item.value, item.label)}
                                                    style={[
                                                      styles.item,
                                                      isItemSelected(item.value) && styles.selectedItem,
                                                    ]}
                                                  >
                                                    <Text style={isItemSelected(item.value) && styles.selectedText}>
                                                      {item.label}
                                                    </Text>
                                                  </TouchableOpacity>
                                              </View>

                                          ))}
                                          
                                    </View>

                                </View>

                            {/* BUTTON TO CLOSE GENRE PICKER */}
                            <TouchableOpacity onPress={closePicker} style={{alignSelf: 'center', height: 40, width: 120, backgroundColor: "#F8EBCE", borderRadius: 10, padding: 10, margin: 10, borderColor: '#771F14', borderStartWidth: 2, borderEndWidth: 3, borderTopWidth: 1, borderBottomWidth: 2.5}}>
                              <Text style={{alignSelf: 'center', }}>Close</Text>
                            </TouchableOpacity>
                                
                            </Modal>
                            
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'center', width: 150, height: 50, borderWidth: 0, paddingLeft: 1, marginTop: -7 }}>
                              <Text style={{marginTop: -25}} numberOfLines={2} ellipsizeMode="tail">
                                {selectedLabels.join(" | ").split(" | ").sort().join(" | ")}
                              </Text>
                            </View>

                    </View>
                </View>

              {/* ============================================================     RATINGS    !!!   RATINGS     RATINGS      !!!  ======================================================    */}

                <View style={{width: '50%', flexDirection: 'row', borderWidth: 0, borderColor: 'blue', }}>
                    <View style={{justifyContent: 'center', alignItems: 'center', borderWidth: 0, width: '100%',}}>

                            <TouchableOpacity onPress={openShowRatingsPicker} style={{ padding: 10, height: 45}}>
                              <Text style={{ color: '#771F14', textAlign: 'center', fontSize: 20 }}>Choose Rating(s)</Text>
                            </TouchableOpacity>

                            <Modal
                              transparent={true}
                              visible={showRatingsPicker}
                              animationType="fade"
                              style={{}}
                            >

                                  <View style={{height: 200, width: 400, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: '#771F14', marginTop: 150, borderRadius: 30, backgroundColor: 'rgba(251, 235, 202, 0.999)', borderStartWidth: 3, borderEndWidth: 7, borderTopWidth: 1, borderBottomWidth: 5}}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>

                                            <View style={{ flexDirection: 'row', marginTop: 16 }}>
                                                {ratings.map((rating) => (
                                                <BouncyCheckbox
                                                    key={rating.id}
                                                    isChecked={rating.isChecked}
                                                    onPress={() => handleRatingChange(rating.id)}
                                                    text={rating.label}
                                                    textStyle={{ fontSize: 16, marginRight: 20, textDecorationLine: 'none'  }}
                                                    iconStyle={{ borderRadius: 5, marginRight: -10 }}
                                                    fillColor="#007AFF"
                                                    unfillColor="rgba(251, 235, 202, 0.999)"            
                                                />
                                                ))}
                                            </View>
                                        </View>
                                  </View>


                            
                            {/* BUTTON TO CLOSE RATING PICKER */}
                            <TouchableOpacity onPress={closeShowRatingsPicker} style={{alignSelf: 'center', height: 40, width: 120, backgroundColor: "#F8EBCE", borderRadius: 10, padding: 10, margin: 10, borderColor: '#771F14', borderStartWidth: 2, borderEndWidth: 3, borderTopWidth: 1, borderBottomWidth: 2.5}}>
                              <Text style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>Close</Text>
                            </TouchableOpacity>


                            </Modal>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'center', width: 150, height: 50, borderWidth: 0, padding: 1, marginTop: -7 }}>
                                <Text style={{ marginLeft: 8, marginTop: -25 }}>{ratingsAsStringDisplay}</Text>
                            </View>

                    </View>
                </View>
            </View>

{/* =====================================================================  ROW 4 --- 75% Height   !!!  SEARCH RESULTS !!!   ======================================================    */}

            <View style={{height: '75%', borderWidth: 0, borderColor: 'purple', marginTop: -15}}>
                <View style={styles.searchItems}>
                    <FlatList
                        numColumns={3}
                        data={searchResults}
                        keyExtractor = {(item, index) => `${index}`}
                        renderItem={_renderItem}
                        onEndReached={loadMore}
                        //keyExtractor={(item) => item.id.toString()} // Use id as a unique key
                        ItemSeparatorComponent={Separator}
                        />
                </View>
            </View>


        </SafeAreaView>

    );
}

{/* ==========================================================================================  STYLES ==============================================================================    */}


const styles = StyleSheet.create({
    form: {
        flexGrow: 1,
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
    },
    item: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    selectedItem: {
      backgroundColor: '#f0f0f0',
    },
    selectedText: {
      color: '#ccc',
    },
  });

export default SearchByDate;