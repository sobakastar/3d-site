import { propsToCSSText  } from "./functions.js";
import { space } from './index.js';

export default {
    elem: document.querySelector('.modal'),
    container: document.querySelector('.modal .container'),
    closeBtn: document.querySelector('.modal .close'),

    init(){
        this.closeBtn.addEventListener('click', () => {
            this.hideModal();
        });
    },

    async showContent(articleId){
        const content = await this.getContent(articleId);
        if(!Array.from(this.elem.classList).includes('modalactive')){
            await this.openModal();
            this.container.innerHTML = content;
            this.container.classList.add('show');
        }else{
            this.container.classList.remove('show');
            await new Promise(resolve => setTimeout(resolve, 500));
            this.container.innerHTML = content;
            this.container.classList.add('show');
        }
    },

    async getContent(articleId){
        const response = await fetch('./content.json');
        const data = await response.json();
        return `<h2>${data[articleId].headline}</h2>${data[articleId].fulltext}`;
    },

    async openModal(){
        space.userEventsLock = true;
        this.elem.classList.add('modalactive');
        space.viewport.props.transform.translateX = [-25, '%'];
        space.viewport.props.transition = ['transform 1.4s ease-in-out', ''];
        space.viewport.elem.style.cssText = propsToCSSText(space.viewport.props);
        await new Promise(resolve => setTimeout(resolve, 1400));
        delete space.viewport.props.transition;
        space.viewport.elem.style.cssText = propsToCSSText(space.viewport.props);
        space.userEventsLock = false;
    },

    async hideModal(){
        space.userEventsLock = true;
        space.viewport.props.transition = ['transform 1.4s ease-in-out', ''];
        delete space.viewport.props.transform.translateX;
        space.viewport.elem.style.cssText = propsToCSSText(space.viewport.props);
        this.elem.classList.remove('modalactive');
        this.container.classList.remove('show');
        await new Promise(resolve => setTimeout(resolve, 1400));
        delete space.viewport.props.transition;
        space.viewport.elem.style.cssText = propsToCSSText(space.viewport.props);
        space.userEventsLock = false;
    }
}