import React, { useState } from 'react';
import { useAnimator } from '@bucky24/react-animate';

import styles from './styles.css';

const config = {
    0: {
        header: {
            'style.top': 0,
            'style.position': 'fixed',
            'style.height': 60,
            'style.font-size': 16,
        },
    },
    10: {
        header: {
            'style.top': 'calc(100% - 60px)',
            'style.opacity': 1,
            'style.font-size': 50,
        },
    },
    15: {
        header: {
            'style.opacity': 0,
        }
    },
    30: {
        header: {
            'style.top': 'calc(100% - 60px)',
            'style.opacity': 0,
        },
    },
    40: {
        header: {
            'style.opacity': 1,
            'style.top': 0,
        },
    }
};

export default function App() {
    const [play, setPlay] = useState(false);
    const animator = useAnimator({ config, autoPlay: play, frameDelay: 100 });
    
    //console.log('doing animate');
    
	return (<div className={styles.appRoot}>
		<div
            {...animator.animate('header')}
        >
            Welcome to Animate Test
        </div>
        <div style={{ marginLeft: "200px" }}>
            <button
                onClick={() => {
                    setPlay(true);
                }}
            >
                Play
            </button>
        </div>
	</div>);
}