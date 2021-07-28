import animator from './src/Animator.js';
import { useState, useEffect, useRef } from 'react';

export const Animator = animator;

const useForceRender = () => {
    const [renderTick, setRenderTick] = useState(0);

    return () => {
        setRenderTick((tick) => {
            return tick + 1;
        });
    }
}

const getAnimator = (animatorObj, forceRender) => {
    return {
        animate: animatorObj ? animatorObj.animate.bind(animatorObj) : () => { return {}; },
        moveTo: (frame) => {
            if (animatorObj) {
                animatorObj.moveTo(frame);
                forceRender();
            }
        },
    };
}

export const useAnimator = function({ config, autoPlay, frameDelay }) {
    const forceRender = useForceRender();
    const animatorRef = useRef(null);
    const [animatorObj, setAnimatorObj] = useState(getAnimator(null, forceRender));
    const [tick, setTick] = useState(0);
    
    useEffect(() => {
        if (!animatorRef.current) {
            //console.log('setting current');
            animatorRef.current = new Animator((tick) => {
                //console.log('setting tick');
                setTick(tick);
            });
        }
        animatorRef.current.setConfig(config);
        animatorRef.current.setAutoPlay(autoPlay);
        animatorRef.current.setFrameDelay(frameDelay);
        
        setAnimatorObj(getAnimator(animatorRef.current, forceRender));
    }, [config, autoPlay, frameDelay]);
    
    useEffect(() => {
        return () => {
            if (animatorRef.current) {
                animatorRef.current.release();
            }
        }
    }, []);
    
    return animatorObj;
}