import React, { Component } from 'react';
import './App.css';

//Tampereelle saapuvat junat.
let sjTre = {
    juna0: {
        nimi: "S 165",
        lähtöasema: "Helsinki",
        pääteasema: "Tampere",
        saapuu: "09:56"
    },
    juna1: {
        nimi: "IC 20",
        lähtöasema: "Oulu",
        pääteasema: "Helsinki",
        saapuu: "09:58"
    },
    juna2: {
        nimi: "P 635",
        lähtöasema: "Helsinki",
        pääteasema: "Jyväskylä",
        saapuu: "10:24"
    },
    juna3: {
        nimi: "Commuter train R",
        lähtöasema: "Helsinki",
        pääteasema: "Tampere",
        saapuu: "10:25"
    },
};

//Tampereelta lähtevät junat.
let ljTre = {
    juna0: {
        nimi: "IC 23",
        lähtöasema: "Helsinki",
        pääteasema: "Oulu",
        saapuu: "11:00"
    },
    juna1: {
        nimi: "IC 464",
        lähtöasema: "Tampere",
        pääteasema: "Helsinki",
        saapuu: "13:57"
    },
    juna2: {
        nimi: "Commuter train R",
        lähtöasema: "Tampere",
        pääteasema: "Helsinki",
        saapuu: "14:07"
    },
    juna3: {
        nimi: "IC 467",
        lähtöasema: "Helsinki",
        pääteasema: "Oulu",
        saapuu: "14:15"
    },
};

//Header komponentti.
class Header extends Component {
    render() {
        return (
            <header className="header">
                <h1>Aseman junatiedot</h1>
            </header>
        );
    }
}

//Rautatieaseman etsintä komponentti.
class AsemaHaku extends Component {
    render() {
        return (
            <div className="asemaHaku">
                <label htmlFor="AsemaHaku">Hae aseman nimellä</label>
                <br />
                <input 
                    type="text" 
                    name="AsemaHaku" 
                    id="AsemaHaku"
                />
            </div>
        );
    }
}

//Lista josta näkee junien tiedot.
//JunaTaulukko komponentin alakomponentti.
class JunaLista extends Component {
    luoRivit = (junalista) => {
        //Luodaan lista riveille.
        let rivit = [];
        //Käydään jokainen juna yksi kerrallaan läpi.
        for(let juna in junalista) {
            //Lisätään listaan uusi taulukon rivi joka on täytetty junan tiedoilla.
            rivit.push(
                <tr key={rivit.length}>
                    <td>{junalista[juna].nimi}</td>
                    <td>{junalista[juna].lähtöasema}</td>
                    <td>{junalista[juna].pääteasema}</td>
                    <td>{junalista[juna].saapuu}</td>
                </tr>
            );
        }
        //Palautetaan lista junataulukon rivejä.
        return rivit;
    };

    //Luodaan junataulukko ja täytetään se luoduilla riveillä.
    //JunaLista komponentin junalista prop määrittelee,
    //luodaanko lista saapuvista vai lähtevistä junista.
    render() {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Juna</th>
                        <th>Lähtöasema</th>
                        <th>Pääteasema</th>
                        <th>Saapuu</th>
                    </tr>
                </thead>
                <tbody>
                    {this.luoRivit(this.props.junalista)}
                </tbody>
            </table>
        );
    }
}

//Pääkomponentti junataulukoiden esittämiseen.
class JunaTaulukko extends Component {
    
    constructor(props) {
        super(props);
        this.toggleDirection = this.toggleDirection.bind(this);
        //Suunta määrittelee kumpi suunta tabi on auki,
        //ja näytetäänkö saapuvat vai lähtevät junat.
        this.state = {
            suunta: "saapuvat",
        };
    }

    //Vaihdetaan suunnan tilaa.
    //Tilan muutos taas vaihtaa näytettävän taulukon.
    //Käytämme painettavan painikkeen lähettämää arvoa,
    //jottei taulukko vaihdu painettaessa sen painiketta.
    toggleDirection = (button, e) => {
        button === "lähtevät" ? 
            this.setState({suunta: "lähtevät"}) : 
            this.setState({suunta: "saapuvat"});
    };
    
    //Komponentti koostuu suunta tabeista,
    //sekä suunnan mukaan vaihtuvasta alakomponentista,
    //joka on joko saapuvien, tai lähtevien junien taulukko.
    render() {
        return (
            <div className="junaTaulukko">
                
                <div className="tableTabs">
                    <button  onClick={this.toggleDirection.bind(this,"saapuvat")}>
                        Saapuvat
                    </button>
                    <button  onClick={this.toggleDirection.bind(this,"lähtevät")}>
                        Lähtevät
                    </button>
                </div>
                
                {(this.state.suunta === "saapuvat") ? <JunaLista suunta="saapuvat" junalista={sjTre} /> : <JunaLista suunta="lähtevät" junalista={ljTre}/>}

            </div>
        );
    }
}

class App extends Component {
  render() {
    return (
        <div className="App">
            <Header />
            <AsemaHaku />
            <JunaTaulukko />
        </div>
    );
  }
}

export default App;
