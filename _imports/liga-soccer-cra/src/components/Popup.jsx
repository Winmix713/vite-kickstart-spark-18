// utils
import PropTypes from 'prop-types';
import loadable from '@loadable/component'

// components
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
// ClickAwayListener removed to avoid @mui/base dependency

// lazy loading components
const Modal = loadable(() => import('@mui/material/Modal'));

const Popup = ({open, onClose, children, popupClass}) => {
    return (
        <Modal open={open} onClose={onClose} closeAfterTransition>
            <Fade in={open} timeout={500}>
                <div className="popup-container" onClick={onClose}>
                    <Grow in={open} timeout={500}>
                        <div className={`${popupClass || ''} popup card card-padded`} style={{minHeight: 'unset'}} onClick={(e) => e.stopPropagation()}>
                            <button className="popup_close" onClick={onClose} aria-label="Close popup">
                                <i className="icon-xmark"/>
                            </button>
                            {children}
                        </div>
                    </Grow>
                </div>
            </Fade>
        </Modal>
    );
}

Popup.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    popupClass: PropTypes.string
}

export default Popup