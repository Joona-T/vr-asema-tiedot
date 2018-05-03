import React, {Component} from 'react';
import JunaLista from "./JunaLista"

//Pääkomponentti junataulukoiden esittämiseen.
export default class JunaTaulukko extends Component {
    
    constructor(props) {
        super(props);
        this.toggleDirection = this.toggleDirection.bind(this);
        this.state = {
            //Suunta määrittelee kumpi suunta tabi on auki,
            //ja näytetäänkö saapuvat vai lähtevät junat.
            suunta: "saapuvat",
            //Lista asemalle saapuvista junista.
            saapuvatJunat: null,
            //Lista asemalta lähtevistä junista.
            lähtevätJunat: null,
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

    //getHours() ja getMinutes() palauttaa yksi numeroiset
    //luvut ilman nollaa. Tämä funktio lisää nollan tarvittaessa.
    lisaaNolla = (aika) => {
        if(aika < 10) {
            return "0" + aika;
        }
        return aika;
    }

    //Muuttaa ISO Date:n (esim. 2015-03-25T12:00:00-06:30)
    //tunneiksi ja minuuteiksi (esim. 12:00).
    luoAikaEsitys = (aika) => {
            let ae = new Date(aika);
            let tunnit = this.lisaaNolla(ae.getHours());
            let minuutit = this.lisaaNolla(ae.getMinutes());
            ae = tunnit + ":" + minuutit;   
            return ae;
    }      

    //Tämä funktio järjestää listan sisällön ominaisuuden mukaan,
    //yhdessä sort-funktion kanssa.
    predicateBy = (prop) =>{
        return function(a,b){
           if( a[prop] > b[prop]){
               return 1;
           }else if( a[prop] < b[prop] ){
               return -1;
           }
           return 0;
        }
     }

    //Funktio junan nimeämiseen.
    nimeaJuna = (juna, junakategoria, linjaID, junatyyppi, junanumero) => {
        //Jos junan kategoria on tyyppiä "Commuter", nimi -> Commuter Train X
        if(junakategoria === "Commuter") {
            juna.nimi = "Commuter train " + linjaID;
        }
        //Muut junat nimetään junan tyypin ja junan numeron mukaan.
        else {
            juna.nimi = junatyyppi + " " + junanumero;
        }
    }

    //Funktio junan lähtö ja pääteasemien nimeämiseen.
    //Funktio muuttaa asemien lyhenteet kokonaisiksi nimiksi.
    nimeaLahtoJaPaateasema = (juna, kaikkiAsemat, lähtöasemaLyhenne, pääteasemaLyhenne) => {
        for(let asema in kaikkiAsemat) {
            if(kaikkiAsemat[asema].lyhenne === lähtöasemaLyhenne) {
                juna.lähtöasema = kaikkiAsemat[asema].nimi;
            }
            if(kaikkiAsemat[asema].lyhenne === pääteasemaLyhenne) {
                juna.pääteasema = kaikkiAsemat[asema].nimi;
            }
        }
    }

    //componentDidUpdate päivittää junalistan.
    //Lista päivitetään api:sta haetuilla junien tiedoilla.
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
            
            //Luodaan väliaikaset listat saapuville, sekä lähteville junille
            let saapuvatJunat = [];
            let lähtevätJunat = [];
            
            //Noudetaan junien tiedot rajapinnasta.
            fetch(url)
            .then((resp) => resp.json())
            .then((junat) => {
                //Filtteröidään jokaisesta junasta tarvittavat tiedot.
                for(let i in junat) {
                    const juna = {};
                    const junakategoria = junat[i].trainCategory;
                    const linjaID = junat[i].commuterLineID;
                    const junatyyppi = junat[i].trainType;
                    const junanumero = junat[i].trainNumber
                            
                    //Nimetään juna.
                    this.nimeaJuna(juna, junakategoria, linjaID, junatyyppi, junanumero);

                    //Junan ohittamien pysäkkien lista.
                    const pysakit = junat[i].timeTableRows;
                    //Lähtöasema on pysakit listan ensimmäinen pysäkki,
                    //päätepysäkki viimeinnen.
                    const lähtöasemaLyhenne = pysakit[0].stationShortCode;
                    const pääteasemaLyhenne = pysakit[pysakit.length - 1].stationShortCode;
                    
                    //Etsitään lähtö- ja pääteasema, ja nimetään ne virallisilla nimillä.
                    this.nimeaLahtoJaPaateasema(juna, this.props.kaikkiAsemat, lähtöasemaLyhenne, pääteasemaLyhenne);

                    //Kirjataan ylös onko juna peruutettu.
                    juna.peruutettu = junat[i].cancelled;

                    //Käydään läpi junan jokainen pysäkki.
                    for(let p in pysakit) {
                        //Etsitään pysäkkien joukosta tarkasteltavaa asemaa vastaavat pysäkkitiedot.
                        //Esim. jos tarkastellaan Lahden pysäkkiä, etsitään Lahden saapumisajat,
                        //ja Lahdesta lähtemisajat.
                        if(this.props.tarkasteltavaAsema.lyhenne === pysakit[p].stationShortCode) {
                            //Pysäkille saapuminen.
                            if(pysakit[p].type === "ARRIVAL") {
                                //Haetaan junan aikataulun mukainen suunniteltu aika,
                                //ja arvioitu toteutumisaika.
                                juna.suunniteltuAika = this.luoAikaEsitys(pysakit[p].scheduledTime);
                                juna.toteutuvaAika = this.luoAikaEsitys(pysakit[p].liveEstimateTime);
                                //Tallennetaan juna saapuvien junien listaan.
                                saapuvatJunat.push(juna)
                            }
                            //Pysäkiltä lähteminen.
                            else if(pysakit[p].type === "DEPARTURE") {
                                //luodaan kopio jo luoduta junasta.
                                //Näin viitteet eivät mene sekaisin.
                                var lähteväJuna = JSON.parse(JSON.stringify(juna));
                                //Haetaan junan aikataulun mukainen suunniteltu aika,
                                //ja arvioitu toteutumisaika.
                                lähteväJuna.suunniteltuAika = this.luoAikaEsitys(pysakit[p].scheduledTime);
                                lähteväJuna.toteutuvaAika = this.luoAikaEsitys(pysakit[p].liveEstimateTime);
                                //Tallennetaan juna lähtevien junien listaan.
                                lähtevätJunat.push(lähteväJuna)
                            }
                        }
                    }
                    
                    
                }
                //Estetään loputon looppi ehtolauseella.
                if(prevState.saapuvatJunat === this.state.saapuvatJunat ||
                   prevState.lähtevätJunat === this.state.lähtevätJunat) {
                    //Järjestetään junat lähtemis/saapumis ajan mukaan.
                    //Järjestely tehdään numeroiden suuruusjärjestyksen mukaan.
                    //Tämä aiheuttaa virheen jos juna lähtee puolenyön jälkeen (esim. klo 00:12).
                    //Tällöin yön lähtö pomppaa listan kärkeen. 
                    saapuvatJunat.sort(this.predicateBy("suunniteltuAika"));
                    lähtevätJunat.sort(this.predicateBy("suunniteltuAika"));
                    //Siirretään junalistat tiloihin, jotka ohjataan seuraavaan komponenttiin.
                    this.setState({
                        saapuvatJunat: saapuvatJunat.slice(0),
                        lähtevätJunat: lähtevätJunat.slice(0),
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
                             className={this.state.suunta === "saapuvat" ? "activeTab" : null}        
                    >
                        Saapuvat
                    </button>
                    <button  onClick={this.toggleDirection.bind(this,"lähtevät")}
                             className={this.state.suunta === "lähtevät" ? "activeTab" : null} 
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