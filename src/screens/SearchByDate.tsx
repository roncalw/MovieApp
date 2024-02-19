import { AxiosError } from 'axios';
import Error from '../../components/Error';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Button, Platform, Alert, Modal, TouchableWithoutFeedback, Dimensions, useWindowDimensions, ListRenderItem, Image  } from 'react-native'
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
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
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';


type SearchByDateParamList = {
  SearchByDate: { directNavigation?: boolean };
};

type SearchByDateRouteProp = RouteProp<SearchByDateParamList, 'SearchByDate'>;


const SearchByDate = () => {

    //=========================================================================    IMAGES SETUP    =========================================================================

  const imagePathNetflix = require('../../assets/images/netflix.png');
  const imagePathHulu = require('../../assets/images/hulu.png');
  const imagePathPrime = require('../../assets/images/amazon_prime.png');
  const imagePathMax = require('../../assets/images/max.png');
  const imagePathYouTube = require('../../assets/images/youtube_premium.png');
  const imagePathDisneyPlus = require('../../assets/images/disney_plus.png');
  const imagePathAppleTVPlus = require('../../assets/images/apple_tv_plus.png');
  const imagePathPeacock = require('../../assets/images/peacock.png');
  const imagePathAMCPlus = require('../../assets/images/amc.png');
  const imagePathParamountPlus = require('../../assets/images/paramount_plus.png');



  //=========================================================================    LOADING PAGE SETUP    =========================================================================

  const [error, setError] = useState<AxiosError | boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(true);

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

    //const pickerRef = useRef<any>(null);

  
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




    //=========================================================================   STREAMER PICKER - BEGIN    =========================================================================

    const [showStreamersPicker, setShowStreamersPicker] = useState(false);
    const [selectedStreamerItems, setSelectedStreamerItems] = useState<string[]>([]);
    const [selectedStreamerLabels, setSelectedStreamerLabels] = useState<string[]>([]);


    const openStreamersPicker = () => {
      setShowStreamersPicker(true);
    };
  
    const closeStreamersPicker = () => {
      setShowStreamersPicker(false);
    };

    
    const streamerItems = [
      { label: 'Netflix', image: imagePathNetflix, value: '8' },
      { label: 'Hulu', image: imagePathHulu, value: '15' },
      { label: 'Prime', image: imagePathPrime, value: '9' },
      { label: 'Max', image: imagePathMax, value: '1899' },
      { label: 'YouTube', image: imagePathYouTube, value: '192' },
      { label: 'Disney Plus', image: imagePathDisneyPlus, value: '337' },
      { label: 'Apple TV Plus', image: imagePathAppleTVPlus, value: '350' },
      { label: 'Peacock', image: imagePathPeacock, value: '387' },
      { label: 'AMC+', image: imagePathAMCPlus, value: '526' },
      { label: 'Paramount+', image: imagePathParamountPlus, value: '531' },
    ];


    useEffect(() => {
      if (!showStreamersPicker) {
        //setSelectedItems([]); // Reset selected items when the modal is closed
      }
    }, [showStreamersPicker]);



    const handleItemSelectedStreamer = (itemValue: string, itemLabel: string) => {
      //console.log('Genre change made');
      setSearchResults([]);
      setPage(1);

      const isSelectedStreamer = selectedStreamerItems.includes(itemValue);

      if (isSelectedStreamer) {
        setSelectedStreamerItems(prevSelectedStreamerItems =>
          prevSelectedStreamerItems.filter(streamerItem => streamerItem !== itemValue)
        );
        setSelectedStreamerLabels(prevSelectedStreamerLabels =>
          prevSelectedStreamerLabels.filter(label => label !== itemLabel)
        );
      } else {
        setSelectedStreamerItems(prevSelectedStreamerItems => [...prevSelectedStreamerItems, itemValue]);
        setSelectedStreamerLabels(prevSelectedStreamerLabels => [...prevSelectedStreamerLabels, itemLabel]);
      }
    };
  
    const isItemSelectedStreamer = (itemValue: string) => {
      return selectedStreamerItems.includes(itemValue);
    };


    useEffect(() => {
      //console.log(`from selected labels: ${selectedLabels}`); // Log the updated selectedItems immediately after state update
    }, [selectedStreamerLabels]);

    //For the query to the database
    const myStreamerArray = selectedStreamerItems;
    let streamerString: string = myStreamerArray.join("|");

    //For the display
    const separatedStreamerStrings = selectedStreamerLabels.join(" | ").split(" | ").sort().join(" | ")


    //=========================================================================   SORT BY PICKER - BEGIN    =========================================================================

    const [showSortByPicker, setShowSortByPicker] = useState(false);



    const openSortByPicker = () => {
      setShowSortByPicker(true); // Open DatePicker
    };
  
    const closeSortByPicker = () => {
      setShowSortByPicker(false);
    };

    const [radioButtons, setRadioButtons] = useState<RadioButtonProps[]>(() => [
      {
          id: '1',
          color: '#68A1ED',
          label: 'Popularity',
          value: '0'
      },
      {
          id: '2',
          color: '#68A1ED',
          label: 'User Rating (500+ Reviews)',
          value: '500'
      },
      {
          id: '3',
          color: '#68A1ED',
          label: 'User Rating (100+ Reviews)',
          value: '100'
      },
      {
          id: '4',
          color: '#68A1ED',
          label: 'User Rating (1+ Reviews)',
          value: '1'
      }
  ]);

  const [selectedValue, setSelectedValue] = useState<string | undefined>();

  const handlePress = (selectedId: string) => {

      setSearchResults([]);
      setPage(1);

      const updatedButtons = radioButtons.map(button =>
          button.id === selectedId ? { ...button, isChecked: true } : { ...button, isChecked: false }
      );
      setSelectedValue(selectedId);
      setRadioButtons(updatedButtons);
  };

  //For the query to the database
  const sortByAsString: string | undefined = radioButtons.find(button => button.id === selectedValue)?.value;

  //For the display
  //const sortByAsStringDisplay: string = selectedSortBy.map(sortBy => sortBy.label).join(' | ');

  const sortByAsStringDisplay: string | undefined = radioButtons.find(button => button.id === selectedValue)?.label




    //=========================================================================    SUBMIT    ================================================================================


    function onSubmit(caller: string, ratings: string, beginDate: string, endDate: string, movieGenres: string, pageNum: number, reSubmitted?: boolean) {
      if (!reSubmitted) {setLoaded(false);}
        //console.log(beginDate);
        //console.log(endDate);
        //console.log(pageNum);
        //console.log(caller);
        //console.log(`Streamers: ${streamerString}`);
        //console.log(`Sort By: ${sortByAsString}`);

        let sortByforQuery: string = "";
        let voteCount: string = "0";

        if (sortByAsString === undefined) {
          sortByforQuery = "popularity.desc";
        }
        else if (sortByAsString === "0")
        {
          voteCount = "0";
          sortByforQuery = "popularity.desc";
        }
        else
        {
          voteCount = sortByAsString;
          sortByforQuery = "vote_average.desc";
        }

        //console.log(`Sort By For Query: ${sortByforQuery}`);

        if (caller === 'submit') {
          setSearchResults([]);
          setPage(1);
        };

        Promise.all(
        [getMoviesByDate(ratingsAsString, beginDate, endDate, movieGenres, streamerString, voteCount, sortByforQuery, pageNum) ]
        
        )
        .then(([movies]) => {
            const data:movieType[] = [...movies];
            setSearchResults(
              
              prevResults => [...prevResults, ...data]
              );
        }).catch(() => {
          setError(true);
        }).finally(() => {
            setLoaded(true);
        });

    };

    //=========================================================================    LOAD MORE    =========================================================================


    const [page, setPage] = useState(1); // Current page

    const loadMore = () => {
      //console.log('Load More')

      const nextPage = page + 1; // Increment the page for the next fetch
      setPage(nextPage);

      onSubmit('loadMore', ratingsAsString, queryDateBegin, queryDateEnd, genreString, nextPage, true)
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


      setSelectedStreamerItems([]);
      setSelectedStreamerLabels([]);

      setSelectedValue("");

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


    //=========================================================================  COLLAPSER - COLLAPSER CODE    =========================================================================

    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = () => {
      setCollapsed(!collapsed);
      //console.log(collapsed);
    };

  
    return (

        <SafeAreaView style={{flexDirection: 'column'}}>

{/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}

{/* ===============================================================================================================================================================================================
============================================================================  ROW 1 --- 5% Height !!! NAVBAR !!! ================================================================
===================================================================================================================================================================================================  */}

{/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}


            <View style={{flex: 1, flexDirection: 'row', height: '5%', borderWidth: 0, borderColor: 'blue', marginBottom: 0, marginTop: -14}}>
                <View style={{width:'90%', height: 50, borderWidth: 0, borderColor: 'red', }}>
                  <Navbar navigation={navigation} page={'sbd'}/>
                </View>
                <View style={{width:'10%', height: 100, borderBottomWidth: 0}}>
                  <TouchableOpacity
                    onPress={() => {
                        onSubmit('submit', ratingsAsString, queryDateBegin, queryDateEnd, genreString, page);
                    }}
                    style={{marginTop: 45, marginLeft: -20}}>
                    <Icon name={'search-outline'} size={30} />
                  </TouchableOpacity>
                </View>
            </View>


{/* ======================================================================================  THE CLOSE BUTTON !!!  ======================================================    */}

{/* ==========================================================================  ROW 2 --- 12% Height  !!!  THE DATE BUTTONS !!!  ======================================================    */}

{/* ======================================================================================  THE CLOSE BUTTON !!!  ======================================================    */}

            <View style={{height: '5%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 0, marginTop: 85, marginBottom: 0}}>
              <TouchableOpacity onPress={toggleCollapsed} style={{ borderWidth: 0, width: 150, height: 30, justifyContent: 'center', alignItems: 'center',}}>
                
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 0, }}>
                    <Text style={{color: '#771F14', fontSize: 16, }}> {collapsed ? " Show Filter" : "Hide Filter"}</Text>
                    <Icon style={{color: '#771F14',}} name={collapsed ? "chevron-forward" : "chevron-up"} size={20} />
              </View>
              </TouchableOpacity>
            </View>

{/* ======================================================================================  THE DATE BUTTONS !!!  ======================================================    */}

{/* ==========================================================================  ROW 2 --- 12% Height  !!!  THE DATE BUTTONS !!!  ======================================================    */}

{/* ======================================================================================  THE DATE BUTTONS !!!  ======================================================    */}


{!collapsed && (

            <View style={{height: '10%', borderWidth: 0, borderColor: 'green', padding: 0, marginTop: -15}}> 

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

)}

{/* ========================================================================  GENRES AND MOVIE RATINGS !!!  ===============================================================    */}

{/* ========================================================================  ROW 3 --- 8% Height   !!!  GENRES AND MOVIE RATINGS !!!  ======================================================    */}

{/* ========================================================================  GENRES AND MOVIE RATINGS !!!  ===============================================================    */}



              {/* ============================================================     GENRES    !!!   GENRES      GENRES      !!!  ======================================================    */}
{!collapsed && (    

            <View style={{flexDirection: 'row', height: '8%', borderWidth: 0, borderColor: 'red', marginTop: 5}}>
                <View style={{width: '50%', flexDirection: 'row', borderWidth: 0, borderColor: 'blue', }}>
                    <View style={{justifyContent: 'center', alignItems: 'center', borderWidth: 0, width: '100%',}}>

                            <TouchableOpacity onPress={openPicker} style={{ padding: 10, height: 45, marginBottom: 0}}>
                              <Text style={{ color: '#771F14', textAlign: 'center', fontSize: 20, }}>Choose Genre(s)</Text>
                            </TouchableOpacity>

                            <Modal
                              transparent={true}
                              visible={modalVisible}
                              animationType="fade"
                              style={{}}
                            >

                                <View style={{height: 200, width: 400, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: '#771F14', marginTop: 150, borderRadius: 30, backgroundColor: 'rgba(251, 235, 202, 0.999)', borderStartWidth: 3, borderEndWidth: 7, borderTopWidth: 1, borderBottomWidth: 5}}>
                                <Text style={{fontSize: 20, color: '#771F14', marginBottom: -5}}>Search by Genre(s)</Text>


                                    <View style={{ borderRadius: 25, margin: 5, marginBottom: -5, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '', padding: 5, justifyContent: 'center', alignItems: 'center', }}>


                                          {items.map((item, index) => (

                                              <View style={{ backgroundColor: 'tan', margin: 1, borderRadius: 10}} key={index}>
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
                                  <Text style={{fontSize: 20, color: '#771F14', marginBottom: 10}}>Search by Rating(s)</Text>

                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>

                                            <View style={{ flexDirection: 'row', marginTop: 16 }}>
                                                {ratings.map((rating) => (
                                                <BouncyCheckbox
                                                    key={rating.id}
                                                    isChecked={rating.isChecked}
                                                    onPress={() => handleRatingChange(rating.id)}
                                                    text={rating.label}
                                                    textStyle={{ marginRight: 20, fontWeight: '600' }}
                                                    iconStyle={{ borderRadius: 2, marginRight: -10 }}
                                                    innerIconStyle={{ borderRadius: 2, marginRight: 0 }}
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
)}

{/* ========================================================================  STREAMERS AND SORT BY !!!  ===============================================================    */}

{/* ========================================================================  ROW 3 --- 8% Height   !!!  STREAMERS AND SUBMIT !!!  ======================================================    */}

{/* ========================================================================  STREAMERS AND SORT BY !!!  ===============================================================    */}

              {/* ============================================================     STREAMERS    !!!   STREAMERS      STREAMERS      !!!  ======================================================    */}

{!collapsed && ( 
              <View style={{flexDirection: 'row', height: '8%', borderWidth: 0, borderColor: 'red', marginTop: 3}}>
                <View style={{width: '50%', flexDirection: 'row', borderWidth: 0, borderColor: 'blue', }}>
                    <View style={{justifyContent: 'center', alignItems: 'center', borderWidth: 0, width: '100%',}}>

                            <TouchableOpacity onPress={openStreamersPicker} style={{ padding: 10, height: 45, marginBottom: 0}}>
                              <Text style={{ color: '#771F14', textAlign: 'center', fontSize: 20 }}>Choose Streamer(s)</Text>
                            </TouchableOpacity>

                            <Modal
                              transparent={true}
                              visible={showStreamersPicker}
                              animationType="fade"
                              style={{}}
                            >

                                <View style={{height: 200, width: 400, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: '#771F14', marginTop: 150, borderRadius: 30, backgroundColor: 'rgba(251, 235, 202, 0.999)', borderStartWidth: 3, borderEndWidth: 7, borderTopWidth: 1, borderBottomWidth: 5}}>
                        
                                <Text style={{fontSize: 20, color: '#771F14', marginBottom: 10}}>Search by Streamer(s)</Text>

                                    <View style={{ width: 350, borderRadius: 25, margin: 5, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '', padding: 5, justifyContent: 'center', alignItems: 'center', }}>

                                          {streamerItems.map((item, index) => (

                                              <View style={{ backgroundColor: '', margin: .5}} key={index}>
                                                  <TouchableOpacity
                                                    key={index}
                                                    onPress={() => handleItemSelectedStreamer(item.value, item.label)}
                                                    style={[
                                                      styles.streamer,
                                                      isItemSelectedStreamer(item.value) && styles.selectedStreamer,
                                                    ]}
                                                  >
                                                    {/* <Text style={isItemSelectedStreamer(item.value) && styles.selectedText}>
                                                      {item.label}
                                                    </Text> */}
                                                    <Image style={{height: 35, width: 70}} source={item.image} />
                                                  </TouchableOpacity>
                                              </View>

                                          ))}
                                          
                                    </View>

                                </View>

                            {/* BUTTON TO CLOSE GENRE PICKER */}
                            <TouchableOpacity onPress={closeStreamersPicker} style={{alignSelf: 'center', height: 40, width: 120, backgroundColor: "#F8EBCE", borderRadius: 10, padding: 10, margin: 10, borderColor: '#771F14', borderStartWidth: 2, borderEndWidth: 3, borderTopWidth: 1, borderBottomWidth: 2.5}}>
                              <Text style={{alignSelf: 'center', }}>Close</Text>
                            </TouchableOpacity>
                                
                            </Modal>
                            
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'center', width: 150, height: 50, borderWidth: 0, paddingLeft: 1, marginTop: -7 }}>
                              <Text style={{marginTop: -25}} numberOfLines={2} ellipsizeMode="tail">
                                {separatedStreamerStrings}
                              </Text>
                            </View>

                    </View>
                </View>

              {/* ============================================================     SORT BY    !!!    SORT BY      SORT BY      !!!  ======================================================    */}

                <View style={{width: '50%', flexDirection: 'row', borderWidth: 0, borderColor: 'blue', }}>
                    <View style={{justifyContent: 'center', alignItems: 'center', borderWidth: 0, width: '100%',}}>

                            <TouchableOpacity onPress={openSortByPicker} style={{ padding: 10, height: 45, marginBottom: 0}}>
                              <Text style={{ color: '#771F14', textAlign: 'center', fontSize: 20 }}>Choose Sort By</Text>
                            </TouchableOpacity>

                            <Modal
                              transparent={true}
                              visible={showSortByPicker}
                              animationType="fade"
                              style={{}}
                            >
                                  <View style={{height: 200, width: 400, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: '#771F14', marginTop: 150, borderRadius: 30, backgroundColor: 'rgba(251, 235, 202, 0.999)', borderStartWidth: 3, borderEndWidth: 7, borderTopWidth: 1, borderBottomWidth: 5}}>
 
                                            <View style={{ marginTop: 16, alignItems: 'center'}}>
                                              <Text style={{fontSize: 20, color: '#771F14', marginBottom: 10}}>Sort By Popularity or User Rating</Text>
                                              <RadioGroup
                                                radioButtons={radioButtons}
                                                onPress={handlePress}
                                                selectedId={selectedValue}
                                                containerStyle={{ alignItems: 'flex-start' }}
                                              />
                                            </View>
                                  </View>

                            {/* BUTTON TO CLOSE RATING PICKER */}
                            <TouchableOpacity onPress={closeSortByPicker} style={{alignSelf: 'center', height: 40, width: 120, backgroundColor: "#F8EBCE", borderRadius: 10, padding: 10, margin: 10, borderColor: '#771F14', borderStartWidth: 2, borderEndWidth: 3, borderTopWidth: 1, borderBottomWidth: 2.5}}>
                              <Text style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>Close</Text>
                            </TouchableOpacity>


                            </Modal> 

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'center', width: 150, height: 50, borderWidth: 0, padding: 1, marginTop: -7 }}>
                                <Text style={{ marginLeft: 8, marginTop: -25 }}>{sortByAsStringDisplay}</Text>
                            </View>

                    </View>
                </View>
            </View>


)}

{/* =====================================================================  ROW 4 --- 67% Height   !!!  SEARCH RESULTS !!!   ======================================================    */}

{loaded && !error &&  

            <View style={{height: collapsed ? '95%': '67%', borderWidth: 0, borderColor: 'purple', marginTop: -15, marginLeft: 8}}>
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

}

{ !loaded && (
  <View style={{height: collapsed ? '95%': '67%', borderWidth: 0, borderColor: 'purple', marginTop: -15, marginLeft: 8}}>
    <ActivityIndicator size="large" />
  </View>
  
  ) } 

{error && (<Error />)}

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
      //borderBottomWidth: 1,
      //borderBottomColor: '#ccc',
    },
    selectedItem: {
      // backgroundColor: '#f0f0f0',
      backgroundColor: 'rgba(251, 235, 202, 0.999)'
    },
    streamer: {
      padding: 3,
      //borderBottomWidth: 1,
      //borderBottomColor: '#ccc',
    },
    selectedStreamer: {
      backgroundColor: 'red',
      // backgroundColor: 'rgba(251, 235, 202, 0.999)'
    },
    selectedText: {
      color: '#777',
    },
  });

export default SearchByDate;