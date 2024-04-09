import {useState} from "react";
import axios from "axios";

function SearchBar_Person({id,setAllUsers,setWordSearch}){
    //id, est l'id de l'utilisateur connecté
    //setAllUsers, fonction qui permet de modifier la liste des utilisateurs
    //setWordSearch, fonction qui permet de modifier le mot recherché

    const [word,setWord] = useState("");//mot recherché

    const getWord = (e) => {
        setWord(e.target.value);
    }

    const handleWord = (e) => {
        e.preventDefault();
        setWordSearch(word);
        axios.get(`http://localhost:4000/api/user/${id}/word`, { //getUsersByWord, Filtre les utilisateurs par nom/prénom
            params: { word },
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            credentials: 'include'
        })
        .then(res => {
            setAllUsers(res.data.users);
        })
        .catch(err => {
            console.log(err);
        }
        )
    }


    return  (<form id="search_form">
                <label id="label_research" htmlFor="request" style={{fontFamily:"'Roboto', sans-serif", fontWeight:"bold",fontSize:"22px"}}>Recherche : </label>
                <input id="request" name="request" type="text" onChange={getWord} placeholder="Tapez le nom/prénom recherché" style={{fontFamily:"'Roboto', sans-serif", fontWeight:"bold"}}/>
                <button id="find_button" type="submit" onClick={handleWord} style={{fontFamily:"'Roboto', sans-serif", fontWeight:"bold"}}>Chercher</button>

            </form>);


}

export default SearchBar_Person;