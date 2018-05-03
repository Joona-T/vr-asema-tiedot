import React, { Component } from 'react';
import './App.css';

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

    handleSubmit(event) {
        event.preventDefault();
        this.props.kaikkiAsemat(this.state.asemat);
        for(let asema in this.state.asemat) {
            if(this.state.asemat[asema].nimi === this.state.value) {
                this.props.asemaHaku(this.state.asemat[asema])
            }
        }
    }

    componentDidMount() {
        //Haetaan kaikki asemat VR:n rajapinnasta.
        fetch("https://rata.digitraffic.fi/api/v1/metadata/stations")
        .then((resp) => resp.json())
        .then((data) => {
            //Luodaan uusi lista asemista, johon kerätään vain aseman virallinen nimi,
            //sekä aseman lyhenne.
            let asemat = data.map((asema) => {
                return {nimi: asema.stationName, lyhenne: asema.stationShortCode}  
            })

            //Päivitetään tila, joka taas päivittää asemahaun ehdotukset.
            this.setState({asemat: asemat});
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
                        placeholder="esim. Lahti"
                    />
                    <datalist id="asemat" >
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
    luoAikaEsitys = (suunniteltuAika, toteutuvaAika, peruutettu) => {
        //Juna ajallaan.
        if((suunniteltuAika === toteutuvaAika && peruutettu === false) || 
           (toteutuvaAika === "NaN:NaN" && peruutettu === false)) {
            return <td>{suunniteltuAika}</td>
        } //Juna poikkeaa aikataulusta:
        else if(suunniteltuAika !== toteutuvaAika && peruutettu === false) {
            return (<td>
                        <span className="toteutuvaAika">{toteutuvaAika}</span>
                        <br/>
                        <span className="vanhaAika">{"(" + suunniteltuAika + ")"}</span>
                    </td>);
        }
        else if(peruutettu === true) {
            return (<td>
                        <span>{suunniteltuAika}</span>
                        <br/>
                        <span className="cancelled">Cancelled</span>
                    </td>);
        }
    }
    
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
                    <tr key={rivit.length} className={junalista[juna].peruutettu ? "peruutettu" : "noClass"}>
                        <td>{junalista[juna].nimi}</td>
                        <td>{junalista[juna].lähtöasema}</td>
                        <td>{junalista[juna].pääteasema}</td>
                        {this.luoAikaEsitys(junalista[juna].suunniteltuAika, junalista[juna].toteutuvaAika, junalista[juna].peruutettu)}
                    </tr>
                );
            }
        }
        else {
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
                        {this.props.suunta === "saapuvat" ? <th>Saapuu</th> : <th>Lähtee</th>}
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
            saapuvatAktiivinen: true,
        };
    }

    //Vaihdetaan suunnan tilaa ja näytettävää junalistaa.
    //Käytämme painettavan painikkeen lähettämää arvoa,
    //jottei taulukko vaihdu painettaessa sen painiketta.
    toggleDirection = (button, e) => {
        button === "lähtevät" ? 
            this.setState({suunta: "lähtevät", saapuvatAktiivinen: false}) : 
            this.setState({suunta: "saapuvat", saapuvatAktiivinen: true});
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
            //Luodaan api url asemahaun tuloksen perusteella. josta
            //Rajapinnasta haetaan 10 seuraavaksi saapuvaa ja 10 seuraavaksi lähtevää junaa. 
            const url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + this.props.tarkasteltavaAsema.lyhenne + "?arrived_trains=0&arriving_trains=10&departed_trains=0&departing_trains=10"
            console.log("Used url: " + url);
            
            //Luodaan väliaikset lista saapuville, sekä lähteville junille
            let saapuvatJunat = [];
            let lähtevätJunat = [];
            
            fetch(url)
            .then((resp) => resp.json())
            .then((junat) => {
                for(let i in junat) {
                    let juna = {};
                    
                    //Jos juna on "Commuter" tyyppiä, annetaan nimeksi Commuter Train + linjaID
                    if(junat[i].trainCategory === "Commuter") {
                        juna.nimi = "Commuter train " + junat[i].commuterLineID;
                    } //Jos juna on muuta tyyppiä, esim pitkän matkan juna, nimeksi tule tyyppi + numero.
                    else {
                        juna.nimi = junat[i].trainType + " " + junat[i].trainNumber;
                    }

                    //Junan ohittamien pysäkkien lista.
                    const pysakit = junat[i].timeTableRows;

                    //Lähtö asema on pysakit listan ensimmäinen pysäkki,
                    //päätepysäkki viimeinnen.
                    let lähtöasemaLyhenne = pysakit[0].stationShortCode;
                    let pääteasemaLyhenne = pysakit[pysakit.length - 1].stationShortCode;
                    

                    for(let j in this.props.kaikkiAsemat) {
                        if(this.props.kaikkiAsemat[j].lyhenne === lähtöasemaLyhenne) {
                            juna.lähtöasema = this.props.kaikkiAsemat[j].nimi;
                        }
                        if(this.props.kaikkiAsemat[j].lyhenne === pääteasemaLyhenne) {
                            juna.pääteasema = this.props.kaikkiAsemat[j].nimi;
                        }
                    }

                    juna.peruutettu = junat[i].cancelled;
                    juna.kategoria = junat[i].trainCategory;

                    for(let k in pysakit) {
                        if((pysakit[k].stationShortCode ===
                        this.props.tarkasteltavaAsema.lyhenne) 
                        && (pysakit[k].type === "ARRIVAL")) {
                            console.log("Saapuva juna: " + juna.nimi);
                            let suunniteltuAika = new Date(pysakit[k].scheduledTime);
                            let tunnit = suunniteltuAika.getHours() < 10 ? 
                                         "0" + suunniteltuAika.getHours():
                                         suunniteltuAika.getHours();
                            let minuutit = suunniteltuAika.getMinutes() < 10 ?
                                           "0" + suunniteltuAika.getMinutes():
                                           suunniteltuAika.getMinutes();
                            let sa = tunnit + ":" + minuutit;
                            let toteutuvaAika = new Date(pysakit[k].liveEstimateTime);
                            tunnit = toteutuvaAika.getHours() < 10 ?
                                     "0" + toteutuvaAika.getHours() :
                                     toteutuvaAika.getHours();
                            minuutit = toteutuvaAika.getMinutes() < 10 ?
                                       "0" + toteutuvaAika.getMinutes() :
                                       toteutuvaAika.getMinutes();
                            let ta = tunnit + ":" + minuutit;
                            
                            juna.suunniteltuAika = sa;
                            juna.toteutuvaAika = ta;
                            juna.suunta = pysakit[k].type;

                            console.log("juna.suunniteltuAikaa: " + juna.suunniteltuAika + " juna.toteutuvaAika: " + juna.toteutuvaAika);
                            if(juna.suunta === "ARRIVAL") {
                                saapuvatJunat.push(juna);
                            }
                            
                        }
                        if((pysakit[k].stationShortCode ===
                        this.props.tarkasteltavaAsema.lyhenne) 
                        && (pysakit[k].type === "DEPARTURE")) {
                            let suunniteltuAika = new Date(pysakit[k].scheduledTime);
                            let tunnit = suunniteltuAika.getHours() < 10 ? 
                                         "0" + suunniteltuAika.getHours():
                                         suunniteltuAika.getHours();
                            let minuutit = suunniteltuAika.getMinutes() < 10 ?
                                           "0" + suunniteltuAika.getMinutes():
                                           suunniteltuAika.getMinutes();
                            let sa = tunnit + ":" + minuutit;
                            
                            let toteutuvaAika = new Date(pysakit[k].liveEstimateTime);
                            tunnit = toteutuvaAika.getHours() < 10 ?
                                     "0" + toteutuvaAika.getHours() :
                                     toteutuvaAika.getHours();
                            minuutit = toteutuvaAika.getMinutes() < 10 ?
                                       "0" + toteutuvaAika.getMinutes() :
                                       toteutuvaAika.getMinutes();
                            let ta = tunnit + ":" + minuutit;
                            
                            juna.suunniteltuAika = sa;
                            juna.toteutuvaAika = ta;
                            juna.suunta = pysakit[k].type;
                            lähtevätJunat.push(juna);
                            
                        }
                    }
                    
                }
                if(prevState.saapuvatJunat === this.state.saapuvatJunat || prevState.lähtevätJunat === this.state.lähtevätJunat) {  
                    console.log(saapuvatJunat);
                    console.log(lähtevätJunat);
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
                    <button  onClick={this.toggleDirection.bind(this,"saapuvat")}
                             className={this.state.saapuvatAktiivinen ? "activeTab" : "button"}        
                    >
                        Saapuvat
                    </button>
                    <button  onClick={this.toggleDirection.bind(this,"lähtevät")}
                             className={this.state.saapuvatAktiivinen ? "button" : "activeTab"} 
                    >
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
        for(let i in this.state.asemat) {
            console.log("Nimi:" + this.state.asemat[i].nimi + " lyhenne: " + this.state.asemat[i].lyhenne)
        }
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
