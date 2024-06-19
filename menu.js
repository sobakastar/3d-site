import { space } from './index.js';
import modal from './modal.js';

export default {
    links: document.querySelectorAll('.menu a'),
    submenu: document.querySelector('.submenu div'),
    fulcrumBtn: document.querySelector('.menu .fulcrum'),

    init(){
        this.links.forEach(link => {
            link.addEventListener('click', (ev) => {
                ev.preventDefault();
                const cubeName = ev.target.hash.replace('#', '');
                const cube = document.querySelector(`[data-name=${cubeName}]`);
                space.selectCube(cube);
                this.links.forEach(lnk => lnk.classList.remove('selected'));
                link.classList.add('selected');
            });
        });

        this.fulcrumBtn.addEventListener('click', () => {
            space.toFulcrum();
            this.submenuDestroy();
        });
    },

    submenuDestroy(){
        this.submenu.innerHTML = '';
        this.submenu.classList.remove('show');
    },

    submenuGenerate(cube){
        const edges = cube.querySelectorAll('article');
        let timeout = 0;
        edges.forEach(edge => {
            const link = document.createElement('a');
            link.href = edge.classList[0];
            link.innerText = edge.querySelector('h2').innerText;
            this.submenu.append(link);
            link.addEventListener('click', (ev) => {
                ev.preventDefault();
                this.selectEdge(edge, cube);
            });
            timeout +=50;
            this.timeoutId = setTimeout(() => {
                this.submenu.classList.add('show');
                link.classList.add('arrival');
            }, timeout);
        });
    },

    selectEdge(edge, cube){
        if(space.activeEdge != edge.dataset.name){
            space.cubeRotation(edge, cube);
            space.activeEdge = edge.dataset.name;
            if(Array.from(modal.elem.classList).includes('modalactive')){
                modal.showContent(edge.dataset.name);
            }
        }else{
            modal.showContent(edge.dataset.name);
        }
    }
}