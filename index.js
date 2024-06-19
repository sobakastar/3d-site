import { roundDegs, randomizer, calcRelativity, propsToCSSText } from "./functions.js";
import menu from './menu.js';
import modal from './modal.js';

export const space = {
    userEventsLock: false,
    transition: {
        time:1500,
        get str(){return `transform ${this.time / 1000}s ease`},
    },
    activeCube: null,
    activeEdge: null,

    viewport: {
        elem: document.querySelector('.viewport'),
        props: {
            transform: {
                scale: [0.4, '']
            }
        }
    },
    wrapper: {
        elem: document.querySelector('.wrapper'),
        actualSize: window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight,
        sizeCoef: 1.3,
        rotate: {
            location: [0,0],
            prevLoc: [0,0],
            degs: [35,340]     // Y,X (!)
        },
        move: {
            location: [0,0],
            prevLoc: [0,0],
            increment: [0,0],
            translate: [0,0]
        },
        props: {
            transform: {
                perspective: [2350, 'px'],
                rotateX: [340, 'deg'],
                rotateY: [35, 'deg'],
                rotateZ: [0, 'deg'],
                translateX: [0, 'px'],
                translateY: [0, 'px'],
                translateZ: [0, 'px'],
            }
        }
    },
    cubes: {
        elems: document.querySelectorAll('.cube'),
        orientations: {
            front:  ['YXZ', 0,   0,    0],
            bottom: ['YXZ', 0,   270,  0],
            back:   ['YXZ', 0,   180,  0],
            top:    ['YXZ', 0,   90,   0],
            left:   ['YZX', 270, 0,    0],
            right:  ['YZX', 270, -180, -180],
        }
    },
    fragments: {
        totalElems: 200,
        currentElems: 0,
        limiter: 300,
        dist: 4500,
        breakaway: 100,
        elemSize: [140, 220],
        classes: ['maple', 'oak', 'chestnut', 'liquidambar', 'linden'],
    },

    init(){
        this.viewport.elem.style.cssText = propsToCSSText(this.viewport.props);
        this.wrapper.elem.style.cssText = propsToCSSText(this.wrapper.props);

        this.cubes.elems.forEach(cube => {
            const offset3d = cube.dataset.offset3d.split(',').map(val => +val);
            const cubeSize = cube.offsetWidth;
            let pos = [
                cubeSize * offset3d[0] + window.innerWidth / 2 - cubeSize / 2,
                cubeSize * offset3d[1] + window.innerHeight / 2 - cubeSize / 2,
                cubeSize * offset3d[2]
            ];
            
            this.cubes[cube.dataset.name] = {
                props: {
                    transformOrigin: [pos[0] + cubeSize / 2, pos[1] + cubeSize / 2, pos[2], 'px'],
                    transform: {
                        rotateX: [0, 'deg'],
                        rotateY: [0, 'deg'],
                        rotateZ: [0, 'deg'],
                        translate3d: [pos[0], pos[1], pos[2], 'px'] 
                    },
                }
            };
            cube.style.cssText = propsToCSSText(this.cubes[cube.dataset.name].props);
        });
        this.transfromSpace();
        this.navi();
        this.fragmentsGenerator();
    },

    transfromSpace(){
        let moveStatus = false;
        let moveType = 'rotate';
        const userEvents = {
            keydown: ['', 'keydown', () => {
                        moveType = 'move';
                    }],
            keyup:   ['', 'keyup', () => {
                        moveType = 'rotate';
                    }],
            press:  ['touchstart', 'mousedown', (ev) => {
                        if(this.userEventsLock || ev.target.closest('.modal')) return;
                        ev.preventDefault();
                        moveStatus = true;
                    }],
            up:     ['touchend', 'mouseup', () => {
                        moveStatus = false;
                        this.wrapper.rotate.location = [0, 0];
                        this.wrapper.move.location = [0, 0];
                    }],
            out:    ['touchcancel', 'mouseleave', () => {
                        moveStatus = false;
                    }],
            move:   ['touchmove', 'mousemove', (ev) => {
                        if(!moveStatus) return;
                        const wTransform = this.wrapper.props.transform;
                        const wMove = this.wrapper.move;
                        const wRotate = this.wrapper.rotate;

                        this.wrapper[moveType].prevLoc[0] = this.wrapper[moveType].location[0];
                        this.wrapper[moveType].prevLoc[1] = this.wrapper[moveType].location[1];

                        this.wrapper[moveType].location = [
                            (ev.clientX != undefined) ? ev.screenX : ev.targetTouches[0].screenX,
                            (ev.clientY != undefined) ? ev.screenY : ev.targetTouches[0].screenY
                        ];

                        if(moveType == 'move'){
                            if(wMove.prevLoc[0]){
                                wMove.increment[0] = wMove.prevLoc[0] - wMove.location[0];
                                wMove.translate[0] -= wMove.increment[0];
                            }
                            if(wMove.prevLoc[1]){
                                wMove.increment[1] = wMove.prevLoc[1] - wMove.location[1];
                                wMove.translate[1] -= wMove.increment[1];
                            }

                            wTransform.translateX[0] +=
                                                wMove.increment[0] * -calcRelativity(wTransform.rotateY[0]).x -
                                                wMove.increment[1] * calcRelativity(wTransform.rotateY[0]).y *
                                                calcRelativity(wTransform.rotateX[0]).y;
                            wTransform.translateY[0] += wMove.increment[1] * -calcRelativity(wTransform.rotateX[0]).x;
                            wTransform.translateZ[0] +=
                                                wMove.increment[0] * -calcRelativity(wTransform.rotateY[0]).y +
                                                wMove.increment[1] * calcRelativity(wTransform.rotateX[0]).y *
                                                calcRelativity(wTransform.rotateY[0]).x;
                        }else{
                            if(wRotate.prevLoc[0]){
                                wRotate.degs[0] = roundDegs(wRotate.degs[0]) - (wRotate.prevLoc[0] - wRotate.location[0]) / 5;
                            }
                            if(wRotate.prevLoc[1]){
                                wRotate.degs[1] = roundDegs(wRotate.degs[1]) + (wRotate.prevLoc[1] - wRotate.location[1]) / 5;
                            }
                            wTransform.rotateY[0] = wRotate.degs[0];
                            wTransform.rotateX[0] = wRotate.degs[1];
                        }

                        this.wrapper.elem.style.cssText = propsToCSSText(this.wrapper.props);
                    }],
            scroll: ['', 'wheel', (ev) => {
                        if(this.userEventsLock || ev.target.closest('.modal')) return;
                        this.viewport.props.transform.scale[0] -= this.viewport.props.transform.scale[0] > 1
                            ? ev.deltaY / 500 * Math.sqrt(this.viewport.props.transform.scale[0])
                            :ev.deltaY / 500 * Math.pow(this.viewport.props.transform.scale[0], 2);
                        this.wrapper.props.transform.perspective[0] =
                                        Math.round(this.wrapper.actualSize / this.wrapper.sizeCoef) *
                                        (1 / this.viewport.props.transform.scale[0]) * Math.sqrt(this.viewport.props.transform.scale[0]);
                        this.viewport.elem.style.cssText = propsToCSSText(this.viewport.props);
                        this.wrapper.elem.style.cssText = propsToCSSText(this.wrapper.props);
                    }]
        };

        let eventKey = 'ontouchstart' in document ? 0 : 1;
        for (const action in userEvents){
            document.addEventListener(userEvents[action][eventKey], (ev) => {
                userEvents[action][2](ev);
            }, false);
        }
    },

    navi(){
        this.cubes.elems.forEach(elem => {
            elem.addEventListener('click', (ev) => {
                if(this.activeCube != elem.dataset.name){
                    this.selectCube(elem);
                }else{
                    const edge = ev.target.closest('article');
                    if(!edge) return;
                    if(this.activeEdge != edge.dataset.name){
                        this.activeEdge = edge.dataset.name;
                        this.cubeRotation(edge, elem);
                    }else{
                        modal.showContent(edge.dataset.name);
                    }
                }
            });
        });
    },

    selectCube(elem){
        clearTimeout(this.timeoutId);
        menu.submenuDestroy();
        this.activeCube = elem.dataset.name;
        this.userEventsLock = true;
        const pos = elem.dataset.offset3d.split(',').map(val => +val);
        this.wrapper.props.transform.translateX[0] = pos[0] * -elem.offsetWidth;
        this.wrapper.props.transform.translateY[0] = pos[1] * -elem.offsetWidth;
        this.wrapper.props.transform.translateZ[0] = pos[2] * -elem.offsetWidth;
        this.wrapper.rotate.degs[0] += randomizer(-25, 25);
        this.wrapper.rotate.degs[1] += randomizer(-15, 15);
        this.wrapper.props.transform.rotateY[0] = this.wrapper.rotate.degs[0];
        this.wrapper.props.transform.rotateX[0] = this.wrapper.rotate.degs[1];
        this.wrapper.props.transform.perspective[0] = Math.round(this.wrapper.actualSize / this.wrapper.sizeCoef);
        this.wrapper.props.transition = [this.transition.str, ''];
        this.wrapper.elem.style.cssText = propsToCSSText(this.wrapper.props);
        this.viewport.props.transform.scale[0] = 1;
        this.viewport.props.transition = [this.transition.str, ''];
        this.viewport.elem.style.cssText = propsToCSSText(this.viewport.props);
        this.timeoutId = setTimeout(() => {
            this.userEventsLock = false;
            this.wrapper.props.transition = '';
            this.viewport.props.transition = '';
            menu.submenuGenerate(elem);
        }, this.transition.time);
    },

    cubeRotation(edge, cube){
        const cubeName = cube.dataset.name;
        const sideName = edge.classList[0];
        let edgeData = Object.assign([], this.cubes.orientations[sideName]);
        let sequence = edgeData.shift();
        let newTransform = {};
        edgeData.forEach((deg, index) => {
            if(index < 2){
                deg = 360 - this.wrapper.rotate.degs[index] - deg;
            }
            newTransform['rotate'+sequence[index]] = [deg, 'deg'];
            delete this.cubes[cubeName].props.transform['rotate'+sequence[index]];
        });
        Object.assign(newTransform, this.cubes[cubeName].props.transform);
        this.cubes[cubeName].props.transform = newTransform;
        cube.style.cssText = propsToCSSText(this.cubes[cubeName].props);
    },

    toFulcrum(){
        this.userEventsLock = true;
        this.viewport.props.transition = [this.transition.str, ''];
        this.wrapper.props.transition = [this.transition.str, ''];

        this.viewport.props.transform.scale[0] = 0.4;
        this.viewport.elem.style.cssText = propsToCSSText(this.viewport.props);

        this.wrapper.props.transform = {
            perspective: [2350, 'px'],
            rotateX: [340, 'deg'],
            rotateY: [35, 'deg'],
            rotateZ: [0, 'deg'],
            translateX: [0, 'px'],
            translateY: [0, 'px'],
            translateZ: [0, 'px'],
        };
        this.wrapper.rotate.degs = [35,340];
        this.wrapper.elem.style.cssText = propsToCSSText(this.wrapper.props);

        setTimeout(() => {
            this.userEventsLock = false;
            this.viewport.props.transition = null;
            this.wrapper.props.transition = null;
        }, this.transition.time);
    },

    fragmentsGenerator(){
        const fSize = randomizer(this.fragments.elemSize[0], this.fragments.elemSize[1]);
        const fProps = {
            width: [fSize, 'px'],
            height: [fSize, 'px'],
            transform: {
                translate3d: [
                    randomizer(-this.fragments.dist, this.fragments.dist) + window.innerWidth / 2 + fSize / 2,
                    randomizer(-this.fragments.dist, this.fragments.dist) + window.innerHeight / 2 + fSize / 2,
                    randomizer(-this.fragments.dist, this.fragments.dist),
                    'px'
                ],
                rotateX: [randomizer(0, 359), 'deg'],
                rotateY: [randomizer(0, 359), 'deg'],
            }
        };

        let insideDetected = false;
        this.cubes.elems.forEach(elem => {
            const [x,y,z] = this.cubes[elem.dataset.name].props.transform.translate3d;
            const ignoredCoords = {
                X: [x - this.fragments.breakaway, x + elem.offsetWidth + this.fragments.breakaway],
                Y: [y - this.fragments.breakaway, y + elem.offsetWidth + this.fragments.breakaway],
                Z: [z - elem.offsetWidth / 2 - this.fragments.breakaway, z + elem.offsetWidth / 2 + this.fragments.breakaway]
            };

            let i = 0;
            for(let axis in ignoredCoords){
                if(
                    !(fProps.transform.translate3d[i] > ignoredCoords[axis][0] &&
                      fProps.transform.translate3d[i] < ignoredCoords[axis][1])
                ){
                    break;
                }else{
                    if(i == 2) insideDetected = true;
                    i++;
                }
            }
        });

        if(!insideDetected){
            const fragment = document.createElement('div');
            fragment.classList.add('fragments');
            fragment.classList.add(this.fragments.classes[randomizer(0, this.fragments.classes.length - 1)]);
            fragment.setAttribute('style', propsToCSSText(fProps));
            this.wrapper.elem.append(fragment);
            this.fragments.currentElems++;
        }

        this.fragments.limiter--;
        if(this.fragments.currentElems < this.fragments.totalElems && this.fragments.limiter > 0){
            this.fragmentsGenerator();
        }
    }
};

space.init();
menu.init();
modal.init();

