import animator from './src/Animator.js';
import { useState, useEffect, useRef } from 'react';

export const Animator = animator;

const getAnimator = (animatorObj) => {
    return {
        animate: animatorObj ? animatorObj.animate.bind(animatorObj) : () => { return {}; },
    };
}

export const useAnimator = function({ config, autoPlay, frameDelay }) {
    const animatorRef = useRef(null);
    const [animatorObj, setAnimatorObj] = useState(getAnimator(null));
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
        
        setAnimatorObj(getAnimator(animatorRef.current));
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