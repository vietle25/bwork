import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, ViewPropTypes as RNViewPropTypes } from 'react-native';
const ViewPropTypes = RNViewPropTypes || View.propTypes;

/**
 * A customizable countdown component for React Native.
 *
 * @export
 * @class TimerCountdown
 * @extends {React.Component}
 */

export default class TimerCountDown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Seconds: this.props.seconds*1000,
      timeoutId: null,
      previousSeconds: null
    };
    this.mounted = false;
    this.tick = this.tick.bind(this);
    this.getFormattedTime = this.getFormattedTime.bind(this);
    this.isFirst = false
  }

  componentDidMount() {
    if (this.state.Seconds > 0) {
      this.mounted = true;
      this.tick();
    }
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (this.state.timeoutId) { clearTimeout(this.state.timeoutId); }
    if (this.state.Seconds > 0) {
      this.mounted = true;
      this.tick();
    }
    if (this.props.seconds != newProps.seconds) {
      this.setState({ previousSeconds: null, Seconds: newProps.seconds * 1000 });
    } else {
      this.setState({previousSeconds: this.state.previousSeconds});
    }
  }

  componentDidUpdate(nextProps, nextState) {
    if ((!this.state.previousSeconds) && this.state.Seconds > 0 && this.mounted) {
      this.tick();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.state.timeoutId);
  }

  tick() {
    if(this.props.isEnable) {
    const currentSeconds = Date.now();
    const dt = this.state.previousSeconds ? (currentSeconds - this.state.previousSeconds) : 0;
    const interval = this.props.interval;

    // correct for small variations in actual timeout time
    const intervalSecondsRemaing = (interval - (dt % interval));
    let timeout = intervalSecondsRemaing;

    if (intervalSecondsRemaing < (interval / 2.0)) {
      timeout += interval;
    }

    const Seconds = Math.max(this.state.Seconds - dt, 0);
    const isComplete = (this.state.previousSeconds && Seconds <= 0);

    if (this.mounted) {
      if (this.state.timeoutId) { clearTimeout(this.state.timeoutId); }
      this.setState({
        timeoutId: isComplete ? null : setTimeout(this.tick, timeout),
        previousSeconds: currentSeconds,
        Seconds: Seconds
      });
    }

    if (isComplete) {
      if (this.props.onTimeElapsed) { this.props.onTimeElapsed(); }
      return;
    }

    if (this.props.onTick) {
      this.props.onTick(Seconds);
    }
  }
  }

  getFormattedTime(milliseconds) {
    if (this.props.formatSecondsRemaining) {
      return this.props.formatSecondsRemaining(milliseconds);
    }
    const totalSeconds = Math.round(milliseconds / 1000);
    let seconds = parseInt(totalSeconds % 60, 10);
    let minutes = parseInt(totalSeconds / 60, 10) % 60;
    let hours = parseInt(totalSeconds / 3600, 10);
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours < 10 ? '0' + hours : hours;
    hours = hours === '00' ? '' : hours + ':';
    return hours + minutes + ':' + seconds;
  }

  getCurrentTime() {
    return this.state.Seconds/1000
  }

  render() {
    const Seconds = this.state.Seconds;
    return (
      <Text
        allowFontScaling={this.props.allowFontScaling}
        style={this.props.style}
      >
      {this.getFormattedTime(Seconds)}
      </Text>
    );
  }
}

TimerCountDown.defaultProps = {
  interval: 1000,
  formatSecondsRemaining: null,
  onTick: null,
  onTimeElapsed: null,
  allowFontScaling: false,
  style: {}
};

TimerCountDown.propTypes = {
  isEnable: PropTypes.bool.isRequired,
  seconds: PropTypes.number.isRequired,
  interval: PropTypes.number,
  formatSecondsRemaining: PropTypes.func,
  onTick: PropTypes.func,
  onTimeElapsed: PropTypes.func,
  allowFontScaling: PropTypes.bool,
  style: Text.propTypes.style,
};