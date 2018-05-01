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
class StationSearch extends Component {
    render() {
        return (
            <div className="stationSearch">
                <label htmlFor="stationSearch">Hae aseman nimellä</label>
                <br />
                <input 
                    type="text" 
                    name="stationSearch" 
                    id="stationSearch"
                />
            </div>
        );
    }
}

//Luodaan junataulukon rivit.
//Yhdellä rivillä on yhden junan tiedot.
class TrainInfoRows extends Component {
    createRows = (junalista) => {
        //Luodaan lista riveille.
        let rivit = [];
        //Käydään jokainen juna yksi kerrallaan läpi.
        for(let juna in junalista) {
            rivit.push(
                <tr>
                    <td>junalista[juna].nimi</td>
                    <td>junalista[juna].lähtöasema</td>
                    <td>junalista[juna].pääteasema</td>
                    <td>junalista[juna].saapuu</td>
                </tr>
            );
        }
        return rivit;
    };
}

//Saapuvien junien taulukko.
class IncomingTable extends Component {
    createRows = (junalista) => {
        //Luodaan lista riveille.
        let rivit = [];
        //Käydään jokainen juna yksi kerrallaan läpi.
        for(let juna in junalista) {
            rivit.push(
                <tr>
                    <td>{junalista[juna].nimi}</td>
                    <td>{junalista[juna].lähtöasema}</td>
                    <td>{junalista[juna].pääteasema}</td>
                    <td>{junalista[juna].saapuu}</td>
                </tr>
            );
        }
        return rivit;
    };
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
                    {this.createRows(sjTre)}
                </tbody>
            </table>
        );
    }
}

//Lähtevien junien taulukko.
class LeavingTable extends Component {
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
                    <tr>
                        <td>IC 23</td>
                        <td>Helsinki</td>
                        <td>Oulu</td>
                        <td>11:00</td>
                    </tr>
                    <tr>
                        <td>IC 464</td>
                        <td>Tampere</td>
                        <td>Helsinki</td>
                        <td>13:57</td>
                    </tr>
                    <tr>
                        <td>Commuter train R</td>
                        <td>Tampere</td>
                        <td>Helsinki</td>
                        <td>14:07</td>
                    </tr>
                    <tr>
                        <td>IC 467</td>
                        <td>Helsinki</td>
                        <td>Oulu</td>
                        <td>14:15</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

//Pääkomponentti junataulukoiden esittämiseen.
class TrainTables extends Component {
    
    constructor(props) {
        super(props);
        this.toggleDirection = this.toggleDirection.bind(this);
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

        // let juna;
        for(let juna in sjTre) {
            console.log(sjTre[juna].nimi);
        }
    };
    
    //Komponentti koostuu suunta tabeista,
    //sekä suunnan mukaan vaihtuvasta alakomponentista,
    //joka on joko saapuvien, tai lähtevien junien taulukko.
    render() {
        return (
            <div className="trainTables">
                
                <div className="tableTabs">
                    <button  onClick={this.toggleDirection.bind(this,"saapuvat")}>
                        Saapuvat
                    </button>
                    <button  onClick={this.toggleDirection.bind(this,"lähtevät")}>
                        Lähtevät
                    </button>
                </div>
                
                {(this.state.suunta === "saapuvat") ? <IncomingTable /> : <LeavingTable />}

            </div>
        );
    }
}

class App extends Component {
  render() {
    return (
        <div className="App">
            <Header />
            <StationSearch />
            <TrainTables />
        </div>
    );
  }
}

export default App;
