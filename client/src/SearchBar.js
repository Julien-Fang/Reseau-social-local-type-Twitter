import {useState} from "react";
import axios from "axios";



function SearchBar({setNumber,page,setWordSearch,setMessagesList}){
    //setNumber, fonction qui permet de modifier le filtre de recherche
    //page, permet de savoir sur quelle page on se trouve
    //setWordSearch, fonction qui permet de modifier le mot recherché
    //setMessagesList, fonction qui permet de modifier la liste des messages

    const [word,setWord] = useState("");//mot recherché


    const getWord = (e) => {
        setWord(e.target.value);
    }


    const handleWord = (e) => {
        e.preventDefault();
        setWordSearch(word);
            axios.get('http://localhost:4000/api/messages/word', { //getMessageByWord, permet de récupérer les messages contenant le mot word
                params: { word },
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
            })
            .then(res => {     
                if(page ==="profil"){
                    setWordSearch(word);
                }     
                else{         
                    setMessagesList(res.data.messages);
                }
            })
            .catch(err => {
                console.log(err);
            }
        )
    }





    return  (<form id="search_form">
                <label id="label_research" htmlFor="request" style={{fontFamily:"'Roboto', sans-serif", fontWeight:"bold", fontSize:"22px"}}>Recherche : </label>
                <input id="request" name="request" type="text" onChange={getWord} placeholder="Tapez le mot recherché" style={{fontFamily:"'Roboto', sans-serif", fontWeight:"bold"}}/>
                <button id="find_button" type="submit" onClick={handleWord} style={{fontFamily:"'Roboto', sans-serif", fontWeight:"bold"}}>Chercher</button>


                { page !== "profil_page"  ? (
                <>
                <label id="request_all">
                    <input type="radio" name="searchOption" onClick={() => setNumber("0")} style={{fontFamily:"'Roboto', sans-serif", fontWeight:"bold"}}/>Tous les messages
                </label>
                <label id="request_friends">
                    <input type="radio" name="searchOption" onClick={() => setNumber("1")} style={{fontFamily:"'Roboto', sans-serif", fontWeight:"bold"}}/>Messages des amis
                </label>
                </>
                ) : null}
                




            </form>);
}

export default SearchBar;