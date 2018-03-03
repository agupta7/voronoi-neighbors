var pendingFunction = null;

function debounce(f, milliseconds, timeoutService, canceller) {
	var _timeout = timeoutService || setTimeout;
	var _cancel = canceller || clearTimeout;

	if (pendingFunction) {
		_cancel(pendingFunction);
	}
	pendingFunction = _timeout(function () {
		pendingFunction = null;
		f();
	}, milliseconds);
}

export default debounce;