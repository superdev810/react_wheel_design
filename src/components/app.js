import React, { Component } from 'react';
import {Button, FormGroup, ControlLabel, FormControl, Modal} from 'react-bootstrap';
import {Layer, Stage, Group, Image, Line, Label, Tag, Text} from 'react-konva';
let wheel = {
    width: 15,
    height: 50
}

let board = {
    width: 270,
    height: 900
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
            // console.log('Load')
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
                width={this.props.width}
                height={this.props.height}
                x={this.props.x}
                y={this.props.y}
                onMouseUp={this.props.mouseUp}
                onDragMove={this.props.dragMove}
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
        // // console.log(this.props.points);
        return (
            <Line
                draggable="false"
                points={this.props.points}
                x={this.props.x}
                y={this.props.y}
                stroke={this.props.stroke}
                strokeWidth={this.props.strokeWidth}
                tension={5}
                onDragStart={this.props.onDragStart}
                onDragMove={this.props.onDragMove}
                onDragEnd={this.props.onDragEnd}
            />
        );
    }
}

class Axle extends Component {
    constructor(props){
        super(props);
    }

    state = {
        line: null
    }

    render() {
        // // console.log(this.props.points);
        return (
            <Line
                draggable="true"
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

        // image mouse event handles
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);

        // draw axles handle
        this.drawAxle = this.drawAxle.bind(this);
        this.axleDownHandle = this.axleDownHandle.bind(this);
        this.axleMoveHandle = this.axleMoveHandle.bind(this);
        this.axleUpHandle = this.axleUpHandle.bind(this);

        // wheel event handles
        this.fitWheelGrid = this.fitWheelGrid.bind(this);
        this.fitAllWheelsGrid = this.fitAllWheelsGrid.bind(this);
        this.setWheelPos = this.setWheelPos.bind(this);

        // board event handles
        this.changeBoardWidth = this.changeBoardWidth.bind(this);
        this.changeBoardHeight = this.changeBoardHeight.bind(this);
        this.boardChange = this.boardChange.bind(this);
        this.handleSetSize = this.handleSetSize.bind(this);
        this.handleBoardWidth = this.handleBoardWidth.bind(this);
        this.handleBoardHeight = this.handleBoardHeight.bind(this);
        this.renderStandardAxis = this.renderStandardAxis.bind(this);

    };

    componentWillMount(){
        this.state = {
            sizeRatio: 24,
            unitLength: 15,
            board:{
                width: 570,
                height: 600
            },
            wheel: {
                width: 15,
                height: 50
            },
            wheelCount: 2,
            vehicleName: '',
            contractArea: '',
            contractPressure: '',
            grossWeight: null,
            image: null,
            wheelPos: [],
            axlesDown: {
                x: null,
                y: null
            },
            axles: [],
            input: {
                width: 570,
                height: 600
            },
            show: false
        };

        for (let i=0; i<this.state.wheelCount; i++) {
            this.state.wheelPos.push({
                x: this.state.wheelPos[i] ? this.state.wheelPos[i].x : i*this.state.wheel.width - (this.state.wheel.width * this.state.sizeRatio / 2),
                y: this.state.wheelPos[i] ? this.state.wheelPos[i].y : -this.state.wheel.height
            })
        }

        window.removeEventListener("resize", this.boardChange);
    }

    componentDidMount(){
        // console.log(this.refs.board.offsetWidth);
        // console.log(this.refs.board.offsetHeight);

        window.addEventListener("resize", this.boardChange);
        this.boardChange();
    }

    handleChange(event){
        // console.log(event.target.value);
        let wheelPosTemp = [];
        this.setState({wheelCount: event.target.value});
        for (let i=0; i<event.target.value; i++) {
            wheelPosTemp.push({
                x: i*this.state.wheel.width - (this.state.wheel.width * this.state.sizeRatio / 2),
                y: 11 * this.state.wheel.height
            })
        }
        this.setState({wheelPos: wheelPosTemp}, function () {
            this.drawAxle();
        });

    }

    boardChange(){
        // console.log(this.refs.board.offsetWidth);
        // console.log(this.refs.board.offsetHeight);

        let tempBoard = {
            width: this.state.board.width,
            height: this.state.board.height
        }
        // console.log('Temp Board Size: ', tempBoard);
        // if(tempBoard.height > window.innerHeight){
        //     tempBoard.height = window.innerHeight;
        // }
        // set wheel width and height
        let wheelSize = this.state.wheel;
        wheelSize.width = (tempBoard.width - (tempBoard.width % this.state.sizeRatio)) / this.state.sizeRatio;
        wheelSize.height = (tempBoard.height - (tempBoard.height % this.state.sizeRatio)) / this.state.sizeRatio;
        // console.log('Grid Width: %s', wheelSize.width);
        // console.log('Grid Height: %s', wheelSize.height);
        this.setState({wheel: wheelSize});

        let boardPan = this.state.board;
        boardPan.width = wheelSize.width * this.state.sizeRatio;
        boardPan.height = wheelSize.height * this.state.sizeRatio;
        // boardPan.height = this.refs.board.offsetHeight;
        this.setState({board: boardPan});

        this.drawGridLines();

        // fit wheels to grids
        for(let index=0; index<this.state.wheelPos.length; index++){
            let tempPos = this.fitWheelGrid(this.state.wheelPos[index].x, this.state.wheelPos[index].y, index);
            let wheelPos = this.state.wheelPos;
            wheelPos[index].x = tempPos.x;
            wheelPos[index].y = tempPos.y;
            this.setState({
                wheelPos: wheelPos
            });
        }

        // fit wheels to default position
        let wheelPosTemp = [];

        for (let i=0; i<this.state.wheelCount; i++) {
            wheelPosTemp.push({
                x: i*this.state.wheel.width - (this.state.wheel.width * this.state.sizeRatio / 2),
                y: 11 * this.state.wheel.height
            })
        }
        this.setState({wheelPos: wheelPosTemp});
    }

    changeBoardWidth(event){
        // console.log('Change Board Size');
        this.boardChange();
    }

    changeBoardHeight(event){
        // console.log('Change Board Size');
        this.boardChange();
    }

    xPosChange(event, index){
        // console.log(this.state.wheelPos);
        let wheelPos = this.state.wheelPos;

        wheelPos[index].x = this.revertStandardAxis(event.target.value, 'x');
        this.setState({
            wheelPos: wheelPos
        });
        this.drawAxle();
        this.fitAllWheelsGrid();
    }

    yPosChange(event, index){
        // console.log(this.state.wheelPos);
        let wheelPos = this.state.wheelPos;
        // let unitCoordinate = this.renderStandardAxis(event.target.value, 'y');
        wheelPos[index].y = this.revertStandardAxis(-event.target.value, 'y');

        this.setState({
            wheelPos: wheelPos
        });

        // draw grid lines
        this.drawAxle();
        this.fitAllWheelsGrid();
    }

    handleMouseUp(event, index){
        // console.log('Parent Callback Mouse Up');
        // console.log(event.target);
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

        // draw grid lines
        this.drawAxle();
    }

    handleDragMove(event, index){
        // console.log('image drag');
        // console.log(event.target._lastPos);
        if(event.target._lastPos.x < 0 || event.target._lastPos.x >= (this.state.board.width - 2* this.state.wheel.width)){
            let tempPos = this.fitWheelGrid(this.state.wheelPos[index].x, this.state.wheelPos[index].y, index);
            this.setWheelPos(index, tempPos);
        }
        if(event.target._lastPos.y < 0 || event.target._lastPos.y >= (this.state.board.height - this.state.wheel.height)){
            let tempPos = this.fitWheelGrid(this.state.wheelPos[index].x, this.state.wheelPos[index].y, index);
            this.setWheelPos(index, tempPos);
        }
    }

    setWheelPos(index, tempPos){
        let wheelPos = this.state.wheelPos;
        wheelPos[index].x = tempPos.x;
        wheelPos[index].y = tempPos.y;
        this.setState({
            wheelPos: wheelPos
        });
    }

    fitWheelGrid(x, y, index){
        if(x%this.state.wheel.width < (this.state.wheel.width/2)) {
            x = Math.floor(x / this.state.wheel.width) * this.state.wheel.width;
        }else{
            x = Math.ceil(x / this.state.wheel.width) * this.state.wheel.width;
        }
        if(y%this.state.wheel.height < (this.state.wheel.height/2)) {
            y = Math.floor(y / this.state.wheel.height) * this.state.wheel.height;
        }else{
            y = Math.ceil(y / this.state.wheel.height) * this.state.wheel.height;
        }
        // console.log("(x, y) = (%s, %s)", x, y);
        return {x: x, y:y};
    }

    fitAllWheelsGrid(){
        // fit wheels to grids
        for(let index=0; index<this.state.wheelPos.length; index++){
            let tempPos = this.fitWheelGrid(this.state.wheelPos[index].x, this.state.wheelPos[index].y, index);
            let wheelPos = this.state.wheelPos;
            wheelPos[index].x = tempPos.x;
            wheelPos[index].y = tempPos.y;
            this.setState({
                wheelPos: wheelPos
            });
        }
    }

    drawGridLines(){
        let grid_lines = [];
        for(let h=-this.state.sizeRatio / 2; h<this.state.sizeRatio / 2; h++){
            grid_lines.push(
                <GridLine
                    key={100+h}
                    points={[-(this.state.wheel.width * this.state.sizeRatio / 2), -h*this.state.wheel.height, (this.state.wheel.width * this.state.sizeRatio / 2), -h*this.state.wheel.height]}
                    x={0} y={0}
                    stroke="#c0c0c0"
                    strokeWidth={1}
                />)
        }
        for(let w=-11; w<this.state.sizeRatio / 2; w++){
            grid_lines.push(
                <GridLine
                    key={200+w}
                    points={[w*this.state.wheel.width, this.state.wheel.height * this.state.sizeRatio / 2, w*this.state.wheel.width, -this.state.wheel.height * this.state.sizeRatio / 2]}
                    x={0} y={0}
                    stroke="#c0c0c0"
                    strokeWidth={1}
                />)
        }
        return(grid_lines);
    }

    drawAxle(){
        let axles = [];

        for(let i=0; i<this.state.wheelPos.length-1; i++){
            for(let j=i+1; j<this.state.wheelPos.length; j++){
                if(this.state.wheelPos[i].y == this.state.wheelPos[j].y){
                    axles.push(
                        <GridLine
                            key={300+i*16+j}
                            points={
                                [
                                    this.state.wheelPos[i].x+this.state.wheel.width/2,
                                    this.state.wheelPos[i].y+this.state.wheel.height/2,
                                    this.state.wheelPos[j].x+this.state.wheel.width/2,
                                    this.state.wheelPos[j].y+this.state.wheel.height/2
                                ]
                            }
                            x={0} y={0}
                            stroke="#4d4d4d"
                            strokeWidth={10}
                            onDragStart={(event) => this.axleDownHandle(event, i, j)}
                            onDragMove={(event) => this.axleMoveHandle(event, i, j)}
                            onDragEnd={(event) => this.axleUpHandle(event, i, j)}
                        />
                    );
                }
            }
        }
        this.setState({axles: axles});
        return(axles);
    }

    // axles functions
    axleDownHandle(event, i, j){
        // console.log('Axle Down');
        let tempPos = {
            x: event.evt.offsetX,
            y: event.evt.offsetY
        };
        this.setState({
            axlesDown: tempPos
        });
    }
    axleMoveHandle(event, i, j){
        // console.log('axle move');
        // console.log(event.evt.offsetX);
        let wheelPos = this.state.wheelPos;
        wheelPos[i].x = wheelPos[i].x + (event.evt.offsetX - this.state.axlesDown.x);
        wheelPos[i].y = wheelPos[i].y + (event.evt.offsetY - this.state.axlesDown.y);
        wheelPos[j].x = wheelPos[j].x + (event.evt.offsetX - this.state.axlesDown.x);
        wheelPos[j].y = wheelPos[j].y + (event.evt.offsetY - this.state.axlesDown.y);

        this.setState({
            wheelPos: wheelPos
        });
        if(event.target._lastPos.x < 0 || event.target._lastPos.x >= (this.state.board.width - 2* this.state.wheel.width)){
            let tempPos = this.fitWheelGrid(this.state.wheelPos[index].x, this.state.wheelPos[index].y, index);
            this.setWheelPos(index, tempPos);
        }
        if(event.target._lastPos.y < 0 || event.target._lastPos.y >= (this.state.board.height - this.state.wheel.height)){
            let tempPos = this.fitWheelGrid(this.state.wheelPos[index].x, this.state.wheelPos[index].y, index);
            this.setWheelPos(index, tempPos);
        }
        let tempPos = {
            x: event.evt.offsetX,
            y: event.evt.offsetY
        };
        this.setState({
            axlesDown: tempPos
        });

    }
    axleUpHandle(event, i, j){
        // console.log('Axle Up');
        // console.log(event);
        // console.log('(i, j) = (%s, %s)', i, j);
        // let wheelPos = this.state.wheelPos;
        // wheelPos[i].x = event.target.attrs.points[0] - this.state.wheel.width/2;
        // wheelPos[i].y = event.target.attrs.points[1] - this.state.wheel.height/2;
        // wheelPos[j].x = event.target.attrs.points[2] - this.state.wheel.width/2;
        // wheelPos[j].y = event.target.attrs.points[3] - this.state.wheel.height/2;
        //
        // this.setState({
        //     wheelPos: wheelPos
        // });
        this.fitAllWheelsGrid();
        this.drawAxle();
    }

    handleSetSize(){
        // console.log('Set Size Handle');
        // console.log(this.state.input);
        this.setState({
            board: this.state.input
        }, function () {
            this.boardChange();
        })
        // this.refs.board.offsetWidth = this.state.input.width;
        // this.refs.board.offsetHeight = this.state.input.height;
    }

    handleBoardWidth(event){
        let input = this.state.board;
        input.width = event.target.value;
        this.setState({
            board: input
        }, function () {
            this.boardChange();
        })
    }

    handleBoardHeight(event){
        let input = this.state.board;
        input.height = event.target.value;
        this.setState({
            board: input
        }, function () {
            this.boardChange();
        })
    }

    renderStandardAxis(realCoordinate, axis){
        let unit;
        if(axis == 'x') {
            unit = Math.floor(realCoordinate / this.state.wheel.width);
        } else{
            unit = Math.floor(realCoordinate / this.state.wheel.height);
        }
        console.log(unit);
        return unit * this.state.unitLength;
    }

    revertStandardAxis(unitCoordinate, axis){
        let real;
        if(axis == 'x') {
            real = unitCoordinate / this.state.unitLength;
            real = real * this.state.wheel.width;
        } else{
            real = Math.floor(unitCoordinate / this.state.unitLength);
            real = (real) * this.state.wheel.height;
        }
        console.log(real);
        return real;
    }

    render() {
        const {wheelPos} = this.state;
        let close = () => this.setState({ show: false});
        let renderAxis = (realCoordinate, axis) => {
            let unit;
            console.log('Real Coordinate: ', realCoordinate);
            console.log()
            if(axis == 'x') {
                unit = realCoordinate / this.state.wheel.width;
            } else{
                unit = realCoordinate / this.state.wheel.height;
            }
            console.log(unit * this.state.unitLength);
            return unit * this.state.unitLength;
        };

        return (
            <div className="container-fluid">
                <div className="container-header">
                    <h1 className="">Vehicle Management</h1>
                    <input type="number" className="text-width ml-30" placeholder="Width" onChange={this.handleBoardWidth}/>
                    <input type="number" className="text-width ml-30" placeholder="Height" onChange={this.handleBoardHeight}/>
                    {/*<button className="btn btn-primary ml-30" onClick={this.handleSetSize}>Set Size</button>*/}
                </div>
                <div className="row mt-30">
                    <div className="text-center" style={{width:'20%', float: 'left'}}>
                        <h9 className="col-md-12 text-center container-title">WHEEL LOCATION COORDINATES</h9>
                        <Button
                            bsStyle="primary"
                            bsSize="large"
                            onClick={() => this.setState({ show: true})}
                        >
                            View Resource
                        </Button>
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
                                        <input
                                            type="text"
                                            placeholder="0.00"
                                            className="text-width"
                                            value={wheelPos?this.renderStandardAxis(wheelPos.x, 'x'):"0.00"}
                                            onChange={(event) => this.xPosChange(event, i)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="0.00"
                                            className="text-width"
                                            value={wheelPos?this.renderStandardAxis(-wheelPos.y-this.state.wheel.height, 'y'):"0.00"}
                                            onChange={(event) => this.yPosChange(event, i)}
                                        />
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="text-center ml-30 mb-30" style={{width:this.state.board.width, height:this.state.board.height, float: 'left'}} ref="board" onChange={() => this.boardChange}>
                        <h7 className="col-md-12 text-center container-title">CUSTOM VEHICLE DISPLAY</h7>
                        <Stage
                            ref="stage"
                            width={this.state.board.width}
                            height={this.state.board.height}
                            y={this.state.wheel.height * this.state.sizeRatio / 2}
                            x={this.state.wheel.width * this.state.sizeRatio / 2}
                            className="mt-100 stage-border mb-30"
                        >
                            <Layer ref="background">
                                {
                                    this.drawGridLines()
                                }
                            </Layer>
                            <Layer ref="axle">
                                {
                                    this.state.axles
                                }
                            </Layer>
                            <Layer ref="layer">
                                {
                                    this.state.wheelPos.map((wheelPos, i) => {
                                        return(
                                            <MyImage
                                                key={i}
                                                x={this.state.wheelPos[i].x}
                                                y={this.state.wheelPos[i].y}
                                                width={this.state.wheel.width}
                                                height={this.state.wheel.height}
                                                mouseUp={(event) => this.handleMouseUp(event, i)}
                                                dragMove={(event) => this.handleDragMove(event, i)}
                                            />
                                        );
                                    })
                                }
                                {
                                    this.state.wheelPos.map((wheelPos, i) => {
                                        return(
                                            <Label key={(i+1) * 1000} x={wheelPos.x+this.state.wheel.width/2} y={wheelPos.y - 10} opacity="0.75">
                                                <Tag
                                                    key={(i+1) * 2000}
                                                    fill="green"
                                                    pointerDirection="down"
                                                    pointerWidth={10}
                                                    pointerHeight={10}
                                                    lineJoin="round"
                                                    shadowColor="black"
                                                    shadowBlur={10}
                                                    shadowOffset={10}
                                                    shadowOpacity={0.5}
                                                />
                                                <Text
                                                    key={(i+1) * 3000}
                                                    text={"(" + this.renderStandardAxis(wheelPos.x, 'x') + ", " + this.renderStandardAxis(-wheelPos.y-this.state.wheel.height, 'y') + ")"}
                                                    fontSize={15}
                                                    padding={5}
                                                    fill="white"
                                                />
                                            </Label>
                                        );
                                    })
                                }
                            </Layer>
                        </Stage>
                    </div>
                    <div className="text-center no-padding ml-30"  style={{width:'15%', float: 'left'}}>
                        <h7 className="col-md-12 text-center container-title">VEHICLE INFORMATION</h7>
                        <FormGroup controlId="formControlsSelect">
                            <ControlLabel>VEHICLE NAME</ControlLabel>
                            <FormControl type="text" value={this.state.vehicleName} placeholder="Vehicle Name"/>
                            <ControlLabel bsClass="mt-30">CONTACT AREA</ControlLabel>
                            <FormControl type="text" value={this.state.vehicleName} placeholder="Contract Area"/>
                            <ControlLabel bsClass="mt-30">CONTACT PRESSURE</ControlLabel>
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
                <Modal
                    show={this.state.show}
                    onHide={close}
                    container={this}
                    bsSize="large"
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title">View Resources</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <iframe src="http://features.pavementdesigner.org/resources/" height={700} width="100%" frameBorder={0}></iframe>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={close}>Go To Main Screen</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
