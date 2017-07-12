import React, { Component } from 'react';
import {Button, FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import {Layer, Stage, Group, Image, Line, Label, Tag, Text} from 'react-konva';
let wheel = {
    width: 30,
    height: 100
}

let board = {
    width: 510,
    height: 800
}

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
                width={wheel.width}
                height={wheel.height}
                x={this.props.x}
                y={this.props.y}
                onMouseUp={this.props.mouseUp}
            />
        );
    }
}

class GridLine extends Component {
    constructor(props){
        super(props);
    }

    state = {
        line: null
    }

    render() {
        // console.log(this.props.points);
        return (
            <Line
                draggable="false"
                points={this.props.points}
                x={this.props.x}
                y={this.props.y}
                stroke={this.props.stroke}
                strokeWidth={this.props.strokeWidth}
                tension={5}
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
        this.fitWheelGrid = this.fitWheelGrid.bind(this);
    };

    componentWillMount(){
        this.state = {
            wheelCount: 2,
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
                x: this.state.wheelPos[i] ? this.state.wheelPos[i].x : i*wheel.width + 0,
                y: this.state.wheelPos[i] ? this.state.wheelPos[i].y : -wheel.height
            })
        }
    }
    handleChange(event){
        console.log(event.target.value);
        let wheelPosTemp = [];
        this.setState({wheelCount: event.target.value});
        for (let i=0; i<event.target.value; i++) {
            wheelPosTemp.push({
                x: this.state.wheelPos[i] ? this.state.wheelPos[i].x : i*wheel.width + 0,
                y: this.state.wheelPos[i] ? this.state.wheelPos[i].y : -wheel.height
            })
        }
        this.setState({wheelPos: wheelPosTemp});
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
        wheelPos[index].y = -event.target.value - wheel.height;

        this.setState({
            wheelPos: wheelPos
        });
        this.drawAxle();
    }

    handleMouseUp(event, index){
        console.log('Parent Callback Mouse Up');
        console.log(event.target);
        let x = event.target.attrs.x;
        let y = event.target.attrs.y;
        // let index = event.target.index;

        let tempPos = this.fitWheelGrid(x, y, index);
        let wheelPos = this.state.wheelPos;
        wheelPos[index].x = tempPos.x;
        wheelPos[index].y = tempPos.y;
        this.setState({
            wheelPos: wheelPos
        });
        this.drawAxle();
    }

    fitWheelGrid(x, y, index){
        if(x%wheel.width < (wheel.width/2)) {
            x = Math.floor(x / wheel.width) * wheel.width;
        }else{
            x = Math.ceil(x / wheel.width) * wheel.width;
        }
        if(y%wheel.height < (wheel.height/2)) {
            y = Math.floor(y / wheel.height) * wheel.height;
        }else{
            y = Math.ceil(y / wheel.height) * wheel.height;
        }
        console.log("(x, y) = (%s, %s)", x, y);
        return {x: x, y:y};
    }

    drawGridLines(){
        let grid_lines = [];
        for(let h=0; h<(board.height/wheel.height); h++){
            grid_lines.push(<GridLine key={100+h} points={[0, -h*wheel.height, board.width, -h*wheel.height]} x={0} y={0} stroke="#c0c0c0" strokeWidth={1}/>)
        }
        for(let w=0; w<(board.width/wheel.width); w++){
            grid_lines.push(<GridLine key={200+w} points={[w*wheel.width, 0, w*wheel.width, -board.height]} x={0} y={0} stroke="#c0c0c0" strokeWidth={1}/>)
        }
        return(grid_lines);
    }

    drawAxle(){
        let axles = [];
        for(let i=0; i<this.state.wheelPos.length-1; i++){
            for(let j=i+1; j<this.state.wheelPos.length; j++){
                if(this.state.wheelPos[i].y == this.state.wheelPos[j].y){
                    axles.push(<GridLine key={300+i*16+j} points={[this.state.wheelPos[i].x+wheel.width/2, this.state.wheelPos[i].y+wheel.height/2, this.state.wheelPos[j].x+wheel.width/2, this.state.wheelPos[j].y+wheel.height/2]} x={0} y={0} stroke="#4d4d4d" strokeWidth={10}/>);
                }
            }
        }
        return(axles);
    }

    render() {
        const {wheelPos} = this.state;

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
                                <option value="2">2 Wheels</option>
                                <option value="3">3 Wheels</option>
                                <option value="4">4 Wheels</option>
                                <option value="5">5 Wheels</option>
                                <option value="6">6 Wheels</option>
                                <option value="7">7 Wheels</option>
                                <option value="8">8 Wheels</option>
                                <option value="9">9 Wheels</option>
                                <option value="10">10 Wheels</option>
                                <option value="11">11 Wheels</option>
                                <option value="12">12 Wheels</option>
                                <option value="13">13 Wheels</option>
                                <option value="14">14 Wheels</option>
                                <option value="15">15 Wheels</option>
                                <option value="16">16 Wheels</option>
                            </FormControl>
                        </FormGroup>
                        {
                            this.state.wheelPos.map((wheelPos, i) => {
                                return(
                                    <div key={i} className="text-input-item">
                                        <span className="text-input-number">{i+1}</span>
                                        <input type="text" placeholder="0.00" className="text-width" value={wheelPos?wheelPos.x:"0.00"} onChange={(event) => this.xPosChange(event, i)}/>
                                        <input type="text" placeholder="0.00" className="text-width" value={wheelPos?-wheelPos.y-wheel.height:"0.00"} onChange={(event) => this.yPosChange(event, i)}/>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="col-md-6 text-center">
                        <h7 className="col-md-12 text-center container-title">CUSTOM VEHICLE DISPLAY</h7>
                        <Stage ref="stage" width={board.width} height={board.height} y={board.height} className="mt-30 stage-border">
                            <Layer ref="background">
                                {
                                    this.drawGridLines()
                                }
                            </Layer>
                            <Layer ref="axle">

                                {
                                    this.drawAxle()
                                }
                            </Layer>
                            <Layer ref="layer">
                                {
                                    this.state.wheelPos.map((wheelPos, i) => {
                                        return(
                                            <MyImage key={i} x={this.state.wheelPos[i].x} y={this.state.wheelPos[i].y} mouseUp={(event) => this.handleMouseUp(event, i)}>
                                            </MyImage>
                                        );
                                    })
                                }
                                {
                                    this.state.wheelPos.map((wheelPos, i) => {
                                        return(
                                            <Label key={(i+1) * 1000} x={wheelPos.x+wheel.width/2} y={wheelPos.y - 10} opacity="0.75">
                                                <Tag key={(i+1) * 2000} fill="green" pointerDirection="down" pointerWidth={10} pointerHeight={10} lineJoin="round" shadowColor="black" shadowBlur={10} shadowOffset={10} shadowOpacity={0.5}>

                                                </Tag>
                                                <Text key={(i+1) * 3000} text={i+1} fontSize={15} padding={5} fill="white" />
                                            </Label>
                                        );
                                    })
                                }
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
                            <FormControl componentClass="select" placeholder="Select Wheels">
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
