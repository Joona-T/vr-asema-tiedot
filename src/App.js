import React, { Component } from 'react';
import './App.css';
import Header from "./components/Header"
import AsemaHaku from "./components/Asemahaku"
import JunaTaulukko from "./components/JunaTaulukko"

class App extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            tarkasteltavaAsema: null,
            asemat: [],
        }
    }

    render() {
        return (
            <div className="App">
                <Header />
                <div className="centered">
                <AsemaHaku 
                    asemaHaku={asema => this.setState({tarkasteltavaAsema: asema})}
                    kaikkiAsemat={kaikkiasemat => this.setState({asemat: kaikkiasemat})}
                />
                
                <JunaTaulukko 
                    tarkasteltavaAsema={this.state.tarkasteltavaAsema && this.state.tarkasteltavaAsema}
                    kaikkiAsemat={this.state.asemat}
                    className="centered"
                />
                </div>
            </div>
        );
  }
}

export default App;
