class Animator {
    constructor(onTick) {
        this.config = {};
        this.autoPlay = true;
        this.currentFrame = -1;
        this.onTick = onTick;
        this.currentProperties = {};
        this.frameDelay = 1000;
        this.highestFrame = 0;
    }
    
    setConfig(newConfig) {
        // build out new config based on id
        this.config = {};
        let highestFrame = 0;
        Object.keys(newConfig).forEach((keyframe) => {
            if (keyframe > highestFrame) {
                highestFrame = keyframe;
            }
            const objects = newConfig[keyframe];
            Object.keys(objects).forEach((id) => {
                const object = objects[id];
                if (!this.config[id]) {
                    this.config[id] = {};
                }
                Object.keys(object).forEach((property) => {
                    const value = object[property];
                    if (!this.config[id][property]) {
                        this.config[id][property] = {};
                    }
                    this.config[id][property][keyframe] = value;
                });
            });
        });
        // we need to run the 0 tick twice. The first time we run it we set all the initial states
        // the second time we actually set animation states if desired. We need to already have
        // initial state set at that point or the transition doesn't actually animate
        this.currentFrame = -1;
        this.highestFrame = highestFrame;
        this.interval = this.doTick();
        //console.log(this.config);
    }
    
    release() {
        clearInterval(this.interval);
    }
    
    setAutoPlay(newAutoPlay) {
        this.autoPlay = newAutoPlay;
        clearInterval(this.interval);
        if (this.autoPlay) {
            this.interval = this.doTick();
        }
    }
    
    setFrameDelay(newFrameDelay) {
        this.frameDelay = newFrameDelay;
        if (this.autoPlay) {
            clearInterval(this.interval);
            this.interval = this.doTick();
        }
        
    }
    
    doTick() {
        this.onTick(this.currentFrame);
        return setInterval(() => {
            const newFrame = Math.min(this.currentFrame + 1, this.highestFrame);
            //console.log(this.highestFrame);
            if (newFrame !== this.currentFrame) {
                this.currentFrame = newFrame;
                this.onTick(this.currentFrame);
            }
        }, this.frameDelay);
    }
    
    animate(id) {
        const config = this.config[id];
        
        if (!config) {
            return null;
        }
        
        const properties = this.currentProperties[id] || {
            style: {},
            animateStyles: [],
        };
        
        const currentFrame = this.currentFrame < 0 ? 0 : this.currentFrame;
        const initialFrame = this.currentFrame < 0;
        
        Object.keys(config).forEach((property) => {
            const data = config[property];
            let currentValue = data[currentFrame];
            if (currentValue !== undefined) {
                if (property.startsWith('style.')) {
                    const styleProp = property.replace('style.', '');
                    
                    // see if we need to animate to another value
                    if (!initialFrame) {
                        const frames = Object.keys(data);
                        const frameIndex = frames.indexOf(`${currentFrame}`);
                        //console.log(frameIndex + 1, frames.length);
                        if (frameIndex + 1 < frames.length) {
                            const nextFrame = frames[frameIndex+1];
                            const nextValue = data[nextFrame];
                            // ignore and don't animate if the next value is null (meaning it's being unset)
                            if (nextValue !== null) {
                                currentValue = nextValue;
                                properties.animateStyles[styleProp] = (nextFrame - this.currentFrame) * this.frameDelay;
                                //console.log('got here', currentValue, styleProp);
                            }
                        } else {
                            delete properties.animateStyles[styleProp];
                        }
                    }
                    
                    properties.style = {
                        ...properties.style,
                        [styleProp]: currentValue,
                    };
                }
            }
        });
        
        this.currentProperties[id] = properties;
        
        // process properties
        const newProperties = {
            ...properties,
            style: {
                ...properties.style,
            },
        };
        
        delete newProperties.animateStyles;
        
        const animateList = Object.keys(properties.animateStyles).map((key) => {
            const duration = properties.animateStyles[key];
            return `${key} ${duration}ms`;
        });
        
        if (animateList.length > 0) {
            newProperties.style.transition = animateList.join(', ');
        }
        
        //console.log(newProperties);
        
        return newProperties;
    }
}

export default Animator;