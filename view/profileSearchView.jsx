import { useState, useContext } from 'react';
import { StyleSheet, Text, TextInput, ScrollView, View, ActivityIndicator, Image, Keyboard  } from 'react-native';
import { subtitleStyles, titleStyles } from '../styles/styles'
import { UserContext } from '../util/context';
import { BLUE_FONT } from '../styles/variables';
import SelectDropdown from 'react-native-select-dropdown'
import TouchableGradient from '../components/TouchableGradient';
import axios from 'axios'
import { servers } from '../data';

export default function ProfileSearch() {
  const { user, getUserInfo } = useContext(UserContext)
  const { id: storedId } = user || {}
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingCandidate, setLoadingCandidate] = useState(false)
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState(null)
  const [name, onChangeName] = useState('Name')
  const [server, setServer] = useState()
  const [candidates, setCandidates] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const searchForCandidates = async () => {
    // TODO: disable search button visually when searching
    // TODO: support more than 50 search results
    Keyboard.dismiss()
    if (loadingCandidates) {
      return
    }
    if (!name) {
      return setErrorMessage('Please enter a name')
    }
    setLoadingCandidates(true)
    setErrorMessage('')
    const serverQuery = server ? `&server=${server}` : ''
    const candidatesPayload = await axios.get(`https://xivapi.com/character/search?name=${name}${serverQuery}`)
    const { data } = candidatesPayload
    if (data.Pagination.PageNext) {
      setLoadingCandidates(false)
      return setErrorMessage('Please be more specific')
    }
    setCandidates(data.Results)
    setLoadingCandidates(false)
  }

  const handleCandidatePress = async (lodestoneId, candidateIdx) => {
    // visually disable selecting other candidates when getting user info
    if (loadingCandidate) {
      return
    }
    setSelectedCandidateIdx(candidateIdx)
    setLoadingCandidate(true)
    await getUserInfo(lodestoneId)
    setSelectedCandidateIdx(null)
    setLoadingCandidate(false)
  }

  return <>
    <Text style={titleStyles}>Angler Search</Text>
    <TextInput
      style={styles.inputBox}
      onChangeText={onChangeName}
      value={name}
    />
    <View style={styles.dropdownContainer}>
      <SelectDropdown
        buttonStyle={styles.serverDropdown}
        buttonTextStyle={styles.serverText}
        data={servers}
        defaultButtonText={'Select a server'}
        onSelect={selectedServer => setServer(selectedServer)}
        buttonTextAfterSelection={() => server}
        rowTextForSelection={server => server}
      />
    </View>
    <View style={styles.searchButtonContainer}>
      <TouchableGradient onPress={() => searchForCandidates()}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableGradient>
    </View>
    <View style={styles.dividerContainer}>
      <View style={styles.divider} />
    </View>
    <ScrollView>
      <Text style={styles.errorText}>{errorMessage}</Text>
      {loadingCandidates
        ? <ActivityIndicator size='large' color={BLUE_FONT} />
        : candidates.map((candidate, candidateIdx) => {
          const { Avatar, ID, Name, Server } = candidate
          return <View style={styles.candidateContainer} key={ID}>
              <TouchableGradient customGradientStyles={{padding: 10}} onPress={() => handleCandidatePress(ID, candidateIdx)}>
                <View style={styles.candidateContentContainer}>
                  <View style={styles.candidatesContentLeftContainer}>
                    <Image style={styles.candidateAvatar} source={{uri: Avatar}} />
                    <Text style={styles.candidateText}>{Name} - {Server}</Text>
                  </View>
                  <View style={styles.statusIndicator}>
                    {selectedCandidateIdx === candidateIdx && <ActivityIndicator color={BLUE_FONT} />}
                    {storedId === ID && <Image style={styles.currentUserIndicator} source={require('../assets/misc/confirmationBadge.png')} /> }
                  </View>
                </View>
            </TouchableGradient>
          </View>
        })
      }
    </ScrollView>
  </>
}

const styles = StyleSheet.create({
  inputBox: {
    margin: 10,
    padding: 15,
    borderWidth: 1,
    color: BLUE_FONT,
    borderColor: BLUE_FONT,
    fontSize: 20
  },
  dropdownContainer: {
    width: '100%',
    padding: 10
  },
  serverDropdown: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: BLUE_FONT,
  },
  serverText: {
    textAlign: 'left',
    color: BLUE_FONT,
    fontSize: 20
  },
  searchButtonContainer: {
    paddingLeft: 10,
    paddingRight: 10
  },
  searchButtonText: {
    padding: 15,
    textAlign: 'center',
    fontSize: 20,
    color: BLUE_FONT
  },
  dividerContainer: {
    padding: 5,
  },
  divider: {
    height: 3,
    borderRadius: 3,
    width: '100%',
    backgroundColor: BLUE_FONT,
    marginBottom: 10
  },
  errorText: {
    ...subtitleStyles,
    color: 'red',
    textAlign: 'center'
  },
  candidateContainer: {
    padding: 10
  },
  candidateContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  candidatesContentLeftContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  candidateAvatar: {
    height: 24,
    width: 24,
    marginRight: 6
  },
  candidateText: {
    color: BLUE_FONT,
    fontSize: 16
  },
  statusIndicator: {
    height: 24,
    width: 24
  },
  currentUserIndicator: {
    height: 24,
    width: 24
  }
});
