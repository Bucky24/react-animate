class Animator {
    constructor(onTick) {
        this.config = {};
        this.autoPlay = true;
        this.currentFrame = -1;
        this.onTick = onTick;
        this.currentProperties = {};
        this.frameDelay = 1000;
        this.highestFrame = 0;
        this.playUntil = 0;
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
        clearInterval(this.interval);
        this.doTick();
        //console.log(this.config);
    }
    
    release() {
        clearInterval(this.interval);
    }
    
    setAutoPlay(newAutoPlay) {
        this.autoPlay = newAutoPlay;
        if (this.currentFrame >= this.playUntil) {
            clearInterval(this.interval);
            this.interval = null;
            if (this.autoPlay) {
                this.doTick();
            }
        }
    }
    
    setFrameDelay(newFrameDelay) {
        this.frameDelay = newFrameDelay;
        if (this.autoPlay) {
            clearInterval(this.interval);
            this.doTick();
        }
        
    }
    
    doTick() {
        this.onTick(this.currentFrame);
        this.interval = setInterval(() => {
            const newFrame = Math.min(this.currentFrame + 1, this.highestFrame);
            //console.log(this.highestFrame);
            if (newFrame !== this.currentFrame) {
                this.currentFrame = newFrame;
                this.onTick(this.currentFrame);
            }
            if (this.currentFrame >= this.playUntil && !this.autoPlay) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }, this.frameDelay);
        return this.interval;
    }

    loadProperty(property, currentValue, animateToValue, frame, nextFrame, properties) {
        const playing = this.autoPlay || this.playUntil > this.currentFrame;

        if (property.startsWith('style.')) {
            const styleProp = property.replace('style.', '');

            if (animateToValue !== null && animateToValue !== undefined) {
                currentValue = animateToValue;
                properties.animateStyles[styleProp] = (nextFrame - frame) * this.frameDelay;
                delete properties.animateStyles[styleProp];
            }

            if (!playing) {
                // reset all animations so that we don't accidentlly animate without meaning to
                properties.animateStyles = [];
            }
            
            properties.style = {
                ...properties.style,
                [styleProp]: currentValue,
            };
        } else if (property === 'rotation') {
            if (animateToValue !== null && animateToValue !== undefined) {
                currentValue = animateToValue;
                properties.animateStyles.transform = (nextFrame - frame) * this.frameDelay;
            }
            properties.style = {
                ...properties.style,
                'transform': `rotate(${currentValue}deg)`,
            };
        }

        return properties;
    }

    moveTo(moveToFrame) {
        if (moveToFrame < 0) {
            moveToFrame = 0;
        }
        // basically find the closest keyframe to this frame that defines all our properites for all ids
        Object.keys(this.config).forEach((id) => {
            const config = this.config[id];
            let properties = {
                style: {},
                animateStyles: {},
            };
            Object.keys(config).forEach((property) => {
                const data = config[property];
                let currentValue = null;
                // find the frame closest to the one given
                const frames = Object.keys(data);
                for (const frame of frames) {
                    if (frame > moveToFrame) {
                        break;
                    }
                    //console.log('for',property,frame, data[frame]);
                    currentValue = data[frame];
                }
                //console.log(property, currentValue);
                if (currentValue !== undefined) {
                    properties = this.loadProperty(property, currentValue, null, null, null, properties);
                }
            });

            //console.log(id, properties);
            this.currentProperties[id] = properties;
        });
        if (moveToFrame === 0) {
            // do a full reset in this case
            moveToFrame = -1;
        }
        this.currentFrame = moveToFrame;
        this.playUntil = 0;
    }

    playTo(playToFrame) {
        if (playToFrame < 0) {
            playToFrame = 0;
        }
        this.playUntil = playToFrame;

        if (this.playUntil > this.currentFrame) {
            clearInterval(this.interval);
            this.interval = null;
            this.doTick();
        }
    }
    
    getForId(id, frame) {
        const config = this.config[id];
        
        if (!config) {
            return null;
        }

        const playing = this.autoPlay || this.playUntil > this.currentFrame;
        
        let properties = this.currentProperties[id] || {
            style: {},
            animateStyles: {},
        };

        const currentFrame = frame < 0 ? 0 : frame;
        const initialFrame = frame < 0;
        
        Object.keys(config).forEach((property) => {
            const data = config[property];
            let currentValue = data[currentFrame];
            if (currentValue !== undefined) {
                let animateToValue = null;
                let nextFrame = null;
                // see if we need to animate to another value
                if (!initialFrame && playing) {
                    const frames = Object.keys(data);
                    const frameIndex = frames.indexOf(`${currentFrame}`);
                    if (frameIndex + 1 < frames.length) {
                        nextFrame = parseInt(frames[frameIndex+1], 10);
                        const nextValue = data[nextFrame];
                        // ignore and don't animate if the next value is null (meaning it's being unset)
                        if (nextValue !== null) {
                            animateToValue = nextValue;
                        }
                    }
                }
                properties = this.loadProperty(property, currentValue, animateToValue, frame, nextFrame, properties);
            }
        });
        
        this.currentProperties[id] = properties;
        return properties;
    }

    animate(id, extraStyles) {
        const properties = this.getForId(id, this.currentFrame);
        if (!properties) {
            return {
                style: extraStyles,
            };
        }
        // process properties
        const newProperties = {
            ...properties,
            style: {
                ...properties.style,
                ...extraStyles,
            },
        };
        
        delete newProperties.animateStyles;
        
        const animateList = Object.keys(properties.animateStyles).map((key) => {
            const duration = properties.animateStyles[key];
            // get correct css properties. Probably a better way to do this but I couldn't get it to work
            let newKey = '';
            for (const char of key) {
                if (char.toLowerCase() !== char) {
                    newKey += '-' + char;
                } else {
                    newKey += char;
                }
            }
            return `${newKey} ${duration}ms`;
        });
        
        if (animateList.length > 0) {
            newProperties.style.transition = animateList.join(', ');
        }

        return newProperties;
    }
}

export default Animator;