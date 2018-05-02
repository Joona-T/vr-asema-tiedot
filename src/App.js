import React, { Component } from 'react';
import './App.css';

const asemat = ["Ahonpää", "Asola", "Eskola", "Espoo", "Hanala", "Tampere"];

//Tampereelle saapuvat junat.
let TampereS = {
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
let TampereL = {
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
            value: "",
            asemat: [],
        }; 
    }
    
    handleChange(event) {
        this.setState({value: event.target.value});
    }
    
    //Helsinki
    //asemat[x] = {nimi: Helsinki, lyhenne: HKI}
    handleSubmit(event) {
        event.preventDefault();
        this.props.kaikkiAsemat(this.state.asemat);
        for(let asema in this.state.asemat) {
            if(this.state.asemat[asema].nimi === this.state.value) {
                this.props.asemaHaku(this.state.asemat[asema])
            }
        }
        // for(let asema in this.state.asemat) {
        //     console.log("Asema: " + asema);
        //     if(asemat[asema].nimi === this.state.value) {
        //         alert(asemat[asema].lyhenne);
        //     }
        // }
        // this.props.asemaHaku(this.state.asemat);
    }

    componentDidMount() {
        //Haetaan kaikki asemat VR:n rajapinnasta.
        fetch("https://rata.digitraffic.fi/api/v1/metadata/stations")
        .then((resp) => resp.json())
        .then((data) => {
            //Filtteröidään pois asemat joilla ei ole matkustajaliikennettä.
            let matkustajaAsemat = data.map((asema) => {
                if(asema.passengerTraffic === true) {
                    return {nimi: asema.stationName, lyhenne: asema.stationShortCode}
                }
            })
            //Trimmataan listasta pois tyhjät arvot.
            matkustajaAsemat = matkustajaAsemat.filter((n) => {
                return n !== undefined
            });
            //Päivitetään tila, joka taas päivittää asemahaun ehdotukset.
            this.setState({asemat: matkustajaAsemat});
            // 
        });
            
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
                        {this.state.asemat.map((asema, i) => {
                            return <option value={asema.nimi} key={i} />
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
        //Tarkistetaan että aseman nimi ei ole null.
        if(junalista) {
            const lkm = junalista.length > 10 ? 10 : junalista.length;
            //Käydään jokainen juna yksi kerrallaan läpi.
            for(let juna = 0; juna < lkm; juna++) {
                //Lisätään listaan uusi taulukon rivi joka on täytetty junan tiedoilla.
                rivit.push(
                    <tr key={rivit.length}>
                        <td>{junalista[juna].nimi}</td>
                        <td>{junalista[juna].lähtöasema}</td>
                        <td>{junalista[juna].pääteasema}</td>
                        <td>{junalista[juna].suunniteltuAika + " " + junalista[juna].toteutuvaAika}</td>
                    </tr>
                );
            }
        }
        else {
            rivit.push(<tr key={0}><td colSpan="4">Ei tietoja saatavilla</td></tr>);
            rivit.push(<tr key={1}><td colSpan="4">Valitse virallinen rautatieasema</td></tr>);
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
                        {this.props.suunta === "saapuvat" ? <th>Saapuu</th> : <th>Lähtee</th>}{console.log("Suunta" + this.props.suunta)}
                    </tr>
                </thead>
                <tbody>
                    {this.props.suunta === "saapuvat" ? this.luoRivit(this.props.saapuvatJunat) :
                    this.luoRivit(this.props.lähtevätJunat)}
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
            junalista: null,
            saapuvatJunat: null,
            lähtevätJunat: null,
        };
    }

    //Vaihdetaan suunnan tilaa ja näytettävää junalistaa.
    //Käytämme painettavan painikkeen lähettämää arvoa,
    //jottei taulukko vaihdu painettaessa sen painiketta.
    toggleDirection = (button, e) => {
        button === "lähtevät" ? 
            this.setState({suunta: "lähtevät"}) : 
            this.setState({suunta: "saapuvat"});
    };

    //Asetetaan saapuvat junat oletus suunnaksi, kun komponentti on ladattu.
    componentDidMount() {
        // this.setState({junalista: TampereS,});
    }

    //trainType esim. "IC"
    //trainNumber esim. "10"
    //Lähtöasema = timeTableRows[0].stationShortCode esim. "JNS"
    //Pääteasema = timeTableRows[timeTableRows.length -1].stationShortCode esim. "HKI"
    //cancelled esim: false
    //Suunniteltu aika = timeTableRows.scheduledTime esim: "2018-05-02T12:12:00.000Z",
    //                   missä timeTableRows[x].stationShortCode === this.props.asema
    //Toteutuva aika = timeTableRows.actualTime esim: "2018-05-02T12:12:32.000Z",
    //                   missä timeTableRows[x].stationShortCode === this.props.asema
    componentDidUpdate(nextProps, prevState) {

        if(this.props.tarkasteltavaAsema !== null) {
            const url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + this.props.tarkasteltavaAsema.lyhenne + "?arrived_trains=0&arriving_trains=10&departed_trains=0&departing_trains=10"
            console.log("Used url: " + url);
            
            let saapuvatJunat = [];
            let lähtevätJunat = [];
            
            const junat = fetch(url)
            .then((resp) => resp.json())
            .then((junat) => {
                for(let i in junat) {
                    let juna = {};
                    
                    juna.nimi = junat[i].trainType + " " + junat[i].trainNumber;

                    let lähtöasemaLyhenne = junat[i].timeTableRows[0].stationShortCode;
                    let pääteasemaLyhenne = junat[i].timeTableRows[junat[i].timeTableRows.length - 1].stationShortCode
                    

                    for(let j in this.props.kaikkiAsemat) {
                        if(this.props.kaikkiAsemat[j].lyhenne === lähtöasemaLyhenne) {
                            juna.lähtöasema = this.props.kaikkiAsemat[j].nimi;
                        }
                        else if(this.props.kaikkiAsemat[j].lyhenne === pääteasemaLyhenne) {
                            juna.pääteasema = this.props.kaikkiAsemat[j].nimi;
                        }
                    }

                    juna.peruutettu = junat[i].cancelled;

                    for(let k in junat[i].timeTableRows) {
                        if(junat[i].timeTableRows[k].stationShortCode ===
                        this.props.tarkasteltavaAsema.lyhenne 
                        && junat[i].timeTableRows[k].type === "ARRIVAL") {
                            let suunniteltuAika = new Date(junat[i].timeTableRows[k].scheduledTime);
                            let tunnit = suunniteltuAika.getHours() < 10 ? 
                                         "0" + suunniteltuAika.getHours():
                                         suunniteltuAika.getHours();
                            let minuutit = suunniteltuAika.getMinutes() < 10 ?
                                           "0" + suunniteltuAika.getMinutes():
                                           suunniteltuAika.getMinutes();
                            let sa = tunnit + ":" + minuutit;
                            
                            let toteutuvaAika = new Date(junat[i].timeTableRows[k].liveEstimateTime);
                            tunnit = toteutuvaAika.getHours() < 10 ?
                                     "0" + toteutuvaAika.getHours() :
                                     toteutuvaAika.getHours();
                            minuutit = toteutuvaAika.getMinutes() < 10 ?
                                       "0" + toteutuvaAika.getMinutes() :
                                       toteutuvaAika.getMinutes();
                            let ta = tunnit + ":" + minuutit;
                            
                            juna.suunniteltuAika = sa;
                            juna.toteutuvaAika = ta;
                            
                            saapuvatJunat.push(juna);
                            
                        }
                        if(junat[i].timeTableRows[k].stationShortCode ===
                        this.props.tarkasteltavaAsema.lyhenne 
                        && junat[i].timeTableRows[k].type === "DEPARTURE") {
                            let suunniteltuAika = new Date(junat[i].timeTableRows[k].scheduledTime);
                            let tunnit = suunniteltuAika.getHours() < 10 ? 
                                         "0" + suunniteltuAika.getHours():
                                         suunniteltuAika.getHours();
                            let minuutit = suunniteltuAika.getMinutes() < 10 ?
                                           "0" + suunniteltuAika.getMinutes():
                                           suunniteltuAika.getMinutes();
                            let sa = tunnit + ":" + minuutit;
                            
                            let toteutuvaAika = new Date(junat[i].timeTableRows[k].liveEstimateTime);
                            tunnit = toteutuvaAika.getHours() < 10 ?
                                     "0" + toteutuvaAika.getHours() :
                                     toteutuvaAika.getHours();
                            minuutit = toteutuvaAika.getMinutes() < 10 ?
                                       "0" + toteutuvaAika.getMinutes() :
                                       toteutuvaAika.getMinutes();
                            let ta = tunnit + ":" + minuutit;
                            
                            juna.suunniteltuAika = sa;
                            juna.toteutuvaAika = ta;
                            
                            lähtevätJunat.push(juna);
                            
                        }
                    }
                    
                }
                if(prevState.saapuvatJunat === this.state.saapuvatJunat && prevState.lähtevätJunat === this.state.lähtevätJunat) {
                    this.setState({
                        saapuvatJunat: saapuvatJunat,
                        lähtevätJunat: lähtevätJunat
                    });
                }
            });
        }
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
                
                <JunaLista 
                    suunta={this.state.suunta}
                    saapuvatJunat={this.state.saapuvatJunat} 
                    lähtevätJunat={this.state.lähtevätJunat} 
                />

            </div>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tarkasteltavaAsema: null,
            asemat: [],
        }
    }

    buttonPushed = () => {
        alert(this.state.tarkasteltavaAsema.nimi);
    }

    render() {
        return (
            <div className="App">
                <Header />
                <AsemaHaku 
                    asemaHaku={asema => this.setState({tarkasteltavaAsema: asema})}
                    kaikkiAsemat={kaikkiasemat => this.setState({asemat: kaikkiasemat})}
                />
                <JunaTaulukko 
                    tarkasteltavaAsema={this.state.tarkasteltavaAsema}
                    kaikkiAsemat={this.state.asemat}
                />
                <button onClick={this.buttonPushed} title="test">Test button</button>
            </div>
        );
  }
}

export default App;
