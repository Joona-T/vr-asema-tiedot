import React, { Component } from 'react';
import './App.css';

const asemat = ["Ahonpää", "Asola", "Eskola", "Espoo", "Hanala"];

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
//Asemien ehdotukset tehdään jokaisen aseman sisältävän listan perusteella.
class AsemaHaku extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            value: ""
        }; 
    }
    
    handleChange(event) {
        this.setState({value: event.target.value});
    }
    
    handleSubmit(event) {
        event.preventDefault();
        this.props.asemaHaku(this.state.value);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} className="asemaHaku">
                <div className="autocomplete" style={{width: "300px"}}>
                    <label htmlFor="AsemaHaku">Hae aseman nimellä</label>
                    <br />
                    <input
                        list="asemat"
                        name="asemat"
                        value={this.state.value}
                        onChange={this.handleChange}
                    />
                    <datalist id="asemat">
                        {this.props.asemat.map((asema, i) => {
                            return <option value={asema} key={i} />
                        })}
                    </datalist>
                    <input type="submit" value="Hae"/>
                </div>
            </form>
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
    }; //Tämän funktion olisi todennäköisesti voinut toteuttaa map:lla.

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
            junalista: {},
        };
    }

    //Vaihdetaan suunnan tilaa ja näytettävää junalistaa.
    //Käytämme painettavan painikkeen lähettämää arvoa,
    //jottei taulukko vaihdu painettaessa sen painiketta.
    toggleDirection = (button, e) => {
        button === "lähtevät" ? 
            this.setState({suunta: "lähtevät", junalista: ljTre}) : 
            this.setState({suunta: "saapuvat", junalista: sjTre});
    };

    //Asetetaan saapuvat junat oletus suunnaksi, kun komponentti on ladattu.
    componentDidMount() {
        this.setState({junalista: sjTre,});
    }
    
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
                
                <JunaLista suunta="saapuvat" junalista={this.state.junalista} /> 

            </div>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {asemanNimi: ""}
    }

    buttonPushed = () => {
        alert(this.state.asemanNimi);
    }

    render() {
        return (
            <div className="App">
                <Header />
                <AsemaHaku asemat={asemat} asemaHaku={nimi => this.setState({asemanNimi: nimi})}/>
                <JunaTaulukko filtteri={this.state.asemanNimi}/>
                <button onClick={this.buttonPushed} title="test">DONT PUSH ME</button>
            </div>
        );
  }
}

export default App;
