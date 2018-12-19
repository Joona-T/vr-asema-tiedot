import React, { Component } from 'react';

//Rautatieaseman etsintä komponentti.
//Asemien ehdotukset tehdään kaikki asemat sisältävän listan perusteella.
export default class AsemaHaku extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            //Tekstikentän arvo.
            value: "",
            //Kaikille asemille tarkoitettu tila.
            asemat: [],
        }; 
    }
    
    //Päivittää tekstikentän arvon.
    handleChange(event) {
        this.setState({value: event.target.value});
    }

    //Asema haun suorittaminen.
    handleSubmit(event) {
        event.preventDefault();
        //Tämä päivittää pääkomponentin tilan, viemällä
        //tiedon asemista ylöspäin.
        this.props.kaikkiAsemat(this.state.asemat);
        //Etsitään inputin arvoa vastaavaa asemaa asemat listasta.
        for(let asema in this.state.asemat) {
            //Jos löydetään vastaava asema, lähetetään haetun aseman nimi ylöspäin.
            if(this.state.asemat[asema].nimi.toLowerCase() === this.state.value.toLowerCase()) {
                this.props.asemaHaku(this.state.asemat[asema])
            }
        }
    }

    //Kun komponentti mountaa, haetaan kaikki junaasemat.
    componentDidMount() {
        //Aasemat haetaan VR:n rajapinnasta.
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