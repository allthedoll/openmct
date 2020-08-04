define([
    '../eventHelpers',
    '../../res/input/selectTemplate.html',
    'EventEmitter',
    'zepto'
], function (
    eventHelpers,
    selectTemplate,
    EventEmitter,
    $
) {

    /**
     * Wraps an HTML select element, and provides methods for dynamically altering
     * its composition from the data model
     * @constructor
     */
    function Select() {
        eventHelpers.extend(this);

        var self = this;

        this.domElement = $(selectTemplate);
        this.options = [];
        this.eventEmitter = new EventEmitter();
        this.supportedCallbacks = ['change'];

        this.populate();

        /**
         * Event handler for the wrapped select element. Also invokes any change
         * callbacks registered with this select with the new value
         * @param {Event} event The change event that triggered this callback
         * @private
         */
        function onChange(event) {
            var elem = event.target,
                value = self.options[$(elem).prop('selectedIndex')];

            self.eventEmitter.emit('change', value[0]);
        }

        this.listenTo($('select', this.domElement), 'change', onChange, this);
    }

    /**
     * Get the DOM element representing this Select in the view
     * @return {Element}
     */
    Select.prototype.getDOM = function () {
        return this.domElement;
    };

    /**
     * Register a callback with this select: supported callback is change
     * @param {string} event The key for the event to listen to
     * @param {function} callback The function that this rule will envoke on this event
     * @param {Object} context A reference to a scope to use as the context for
     *                         context for the callback function
     */
    Select.prototype.on = function (event, callback, context) {
        if (this.supportedCallbacks.includes(event)) {
            this.eventEmitter.on(event, callback, context || this);
        } else {
            throw new Error('Unsupported event type' + event);
        }
    };

    /**
     * Update the select element in the view from the current state of the data
     * model
     */
    Select.prototype.populate = function () {
        var self = this,
            selectedIndex = 0;

        selectedIndex = $('select', this.domElement).prop('selectedIndex');
        $('option', this.domElement).remove();

        self.options.forEach(function (option, index) {
            $('select', self.domElement)
                .append('<option value = "' + option[0] + '"' + ' >'
                        + option[1] + '</option>');
        });

        $('select', this.domElement).prop('selectedIndex', selectedIndex);
    };

    /**
     * Add a single option to this select
     * @param {string} value The value for the new option
     * @param {string} label The human-readable text for the new option
     */
    Select.prototype.addOption = function (value, label) {
        this.options.push([value, label]);
        this.populate();
    };

    /**
     * Set the available options for this select. Replaces any existing options
     * @param {string[][]} options An array of [value, label] pairs to display
     */
    Select.prototype.setOptions = function (options) {
        this.options = options;
        this.populate();
    };

    /**
     * Sets the currently selected element an invokes any registered change
     * callbacks with the new value. If the value doesn't exist in this select's
     * model, its state will not change.
     * @param {string} value The value to set as the selected option
     */
    Select.prototype.setSelected = function (value) {
        var selectedIndex = 0,
            selectedOption;

        this.options.forEach (function (option, index) {
            if (option[0] === value) {
                selectedIndex = index;
            }
        });
        $('select', this.domElement).prop('selectedIndex', selectedIndex);

        selectedOption = this.options[selectedIndex];
        this.eventEmitter.emit('change', selectedOption[0]);
    };

    /**
     * Get the value of the currently selected item
     * @return {string}
     */
    Select.prototype.getSelected = function () {
        return $('select', this.domElement).prop('value');
    };

    Select.prototype.hide = function () {
        $(this.domElement).addClass('hidden');
        $('.equal-to').addClass('hidden');
    };

    Select.prototype.show = function () {
        $(this.domElement).removeClass('hidden');
        $('.equal-to').removeClass('hidden');
    };

    Select.prototype.destroy = function () {
        this.stopListening();
    };

    return Select;
});
