import React from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../../context/auth-context';
import './MainNavigation.css';

const mainNavigation = props => (
    <AuthContext.Consumer>
      {context => {
        return (
          <header className="main-navigation">
            <div className="main-navigation__logo">
              <h1>Ultra Management</h1>
            </div>
            <nav className="main-navigation__items">
              <ul>
                {!context.token && (
                  <li>
                    <NavLink to="/auth">Login/Signup</NavLink>
                  </li>
                )}
                <li>
                  <NavLink to="/images">Images</NavLink>
                </li>
                {context.token && (
                <React.Fragment>
                  {/* <li>
                    <NavLink to="/bookings">Bookings</NavLink>
                  </li> */}
                  <li>
                    <button onClick={context.logout}>Logout</button>
                  </li>
                </React.Fragment>
              )}
              </ul>
            </nav>
          </header>
        );
      }}
    </AuthContext.Consumer>
  );
  
  export default mainNavigation;