import React, { Component } from 'react';
import {Button, FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import {Layer, Stage, Group, Image, Line} from 'react-konva';

class MyImage extends Component {
    constructor(props){
        super(props);
    }

    state = {
        image: null
    }
    componentDidMount() {
        const image = new window.Image();
        image.src = '/assets/img/right.png';
        image.onload = () => {
            console.log('Load')
            this.setState({
                image: image
            });
        }

    }

    render() {
        return (
            <Image
                image={this.state.image}
                draggable="true"
                width="30"
                height="100"
                x={this.props.x}
                y={this.props.y}
                onMouseUp={this.props.mouseUp}
            />
        );
    }
}

export default class App extends Component {
    constructor(props){
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.xPosChange = this.xPosChange.bind(this);
        this.yPosChange = this.yPosChange.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.drawAxle = this.drawAxle.bind(this);
    };

    componentWillMount(){
        this.state = {
            wheelCount: 3,
            vehicleName: '',
            contractArea: '',
            contractPressure: '',
            grossWeight: null,
            image: null,
            wheelPos: [],
            axles: []
        };

        for (let i=0; i<this.state.wheelCount; i++) {
            this.state.wheelPos.push({
                x: this.state.wheelPos[i] ? this.state.wheelPos[i].x : 0,
                y: this.state.wheelPos[i] ? this.state.wheelPos[i].y : 0
            })
        }
    }
    handleChange(event){
        console.log(event.target.value);
        for (let i=0; i<this.state.wheelCount; i++) {
            this.state.wheelPos.push({
                x: this.state.wheelPos[i] ? this.state.wheelPos[i].x : 0,
                y: this.state.wheelPos[i] ? this.state.wheelPos[i].y : 0
            })
        }
        this.setState({wheelCount: event.target.value});
    }

    xPosChange(event, index){
        console.log(this.state.wheelPos);
        let wheelPos = this.state.wheelPos;
        wheelPos[index].x = event.target.value;
        this.setState({
            wheelPos: wheelPos
        });
        this.drawAxle();
    }

    yPosChange(event, index){
        console.log(this.state.wheelPos);
        let wheelPos = this.state.wheelPos;
        wheelPos[index].y = event.target.value;
        this.setState({
            wheelPos: wheelPos
        });
        this.drawAxle();
    }

    handleMouseUp(event){
        console.log('Parent Callback Mouse Up');
        console.log(event.target);
        let x = event.target.attrs.x;
        let y = event.target.attrs.y;
        let index = event.target.index;

        let wheelPos = this.state.wheelPos;
        wheelPos[index].x = x;
        wheelPos[index].y = y;
        this.setState({
            wheelPos: wheelPos
        });
        this.drawAxle();
    }

    drawAxle(){
        
    }

    render() {
        let xyInputs = [];
        let wheels = [];

        for (let i=0; i<this.state.wheelCount; i++){
            xyInputs.push(
                <div key={i} className="text-input-item">
                    <span className="text-input-number">{i+1}</span>
                    <input type="text" placeholder="0.00" className="text-width" value={this.state.wheelPos[i]?this.state.wheelPos[i].x:"0.00"} onChange={(event) => this.xPosChange(event, i)}/>
                    <input type="text" placeholder="0.00" className="text-width" value={this.state.wheelPos[i]?this.state.wheelPos[i].y:"0.00"} onChange={(event) => this.yPosChange(event, i)}/>
                </div>
            );

            wheels.push(
                <MyImage key={i} x={this.state.wheelPos[i].x} y={this.state.wheelPos[i].y} mouseUp={this.handleMouseUp}/>
            );
        }

        return (
            <div className="container-fluid">
                <div className="col-md-12 container-header">
                    <h1>Vehicle Management</h1>
                </div>
                <div className="row container">
                    <div className="col-md-4 text-center">
                        <h9 className="col-md-12 text-center container-title">WHEEL LOCATION COORDINATES</h9>
                        <FormGroup controlId="formControlsSelect">
                            <ControlLabel>Select Wheels:</ControlLabel>
                            <FormControl componentClass="select" placeholder="Select Wheels" value={this.state.wheelCount} onChange={this.handleChange}>
                                <option value="3">3 Wheels</option>
                                <option value="4">4 Wheels</option>
                                <option value="5">5 Wheels</option>
                                <option value="6">6 Wheels</option>
                                <option value="7">7 Wheels</option>
                            </FormControl>
                        </FormGroup>
                        {xyInputs}
                    </div>
                    <div className="col-md-6 text-center">
                        <h7 className="col-md-12 text-center container-title">CUSTOM VEHICLE DISPLAY</h7>
                        <Stage ref="stage" width={500} height={700} className="mt-30 stage-border">
                            <Layer ref="layer">
                                {wheels}
                                {this.state.axles}
                            </Layer>
                        </Stage>
                    </div>
                    <div className="col-md-2 text-center no-padding">
                        <h7 className="col-md-12 text-center container-title">VEHICLE INFORMATION</h7>
                        <FormGroup controlId="formControlsSelect">
                            <ControlLabel>VEHICLE NAME</ControlLabel>
                            <FormControl type="text" value={this.state.vehicleName} placeholder="Vehicle Name"/>
                            <ControlLabel bsClass="mt-30">CONTRACT AREA</ControlLabel>
                            <FormControl type="text" value={this.state.vehicleName} placeholder="Contract Area"/>
                            <ControlLabel bsClass="mt-30">CONTRACT PRESSURE</ControlLabel>
                            <FormControl type="text" value={this.state.vehicleName} placeholder="Contract Pressure"/>
                            <ControlLabel bsClass="mt-30">GROSS WEIGHT</ControlLabel>
                            <FormControl type="text" value={this.state.vehicleName} placeholder="Gross Weight"/>
                            <ControlLabel bsClass="mt-30">GEAR CONFIGURATION</ControlLabel>
                            <FormControl componentClass="select" placeholder="Select Wheels" value={this.state.wheelCount} onChange={this.handleChange}>
                                <option value="3">Select Config</option>
                                <option value="4">Select Config1</option>
                                <option value="5">Select Config2</option>
                            </FormControl>
                        </FormGroup>

                    </div>
                </div>
            </div>
        );
    }
}
