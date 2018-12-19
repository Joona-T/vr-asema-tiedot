import React, {Component} from 'react';

//Lista josta näkee junien tiedot.
//JunaTaulukko komponentin alakomponentti.
export default class JunaLista extends Component {
    
    //Funktio saapumis/lähtemis ajan oikeanlaiseen ilmaisemiseen.
    luoAikaEsitys = (suunniteltuAika, toteutuvaAika, peruutettu) => {
        //Juna ajallaan. Esitetään yksi kellonaika, joka on aikataulun aika.
        if((suunniteltuAika === toteutuvaAika && peruutettu === false) || 
           (toteutuvaAika === "NaN:NaN" && peruutettu === false)) {
            return <td>{suunniteltuAika}</td>
        } //Juna poikkeaa aikataulusta. Toteutuva aika saa huomiovärin,
          //ja alkuperäinen aika esitetään suluissa.
        else if(suunniteltuAika !== toteutuvaAika && peruutettu === false) {
            return (<td>
                        <span className="toteutuvaAika">{toteutuvaAika}</span>
                        <br/>
                        <span className="vanhaAika">{"(" + suunniteltuAika + ")"}</span>
                    </td>);
        } //Jos juna on peruutettu, esitetään alkuperäinen aika pienellä, sekä peruutettu teksti.
        else if(peruutettu === true) {
            return (<td>
                        <span>{suunniteltuAika}</span>
                        <br/>
                        <span className="cancelled">Cancelled</span>
                    </td>);
        }
    }
    
    //Luo ja palauttaa listan junarivejä.
    luoRivit = (junalista) => {
        //Luodaan lista riveille.
        let rivit = [];
        //Tarkistetaan että aseman nimi ei ole null.
        if(junalista) {
            //Listataan korkeintaan 10 junaa.
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
        //Jos käyttäjä ei ole etsinyt oikeellista asemaa, ohjeistetaan häntä tekemään niin.
        else {
            rivit.push(<tr key={1}><td colSpan="4">Valitse virallinen rautatieasema</td></tr>);
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
