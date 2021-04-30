import React from 'react';

import './Spinner.css';

const spinner = () => (
    <React.Fragment>
        <div className="spinner">
            <div className="lds-dual-ring" />
        </div>
    </React.Fragment>
);

export default spinner;