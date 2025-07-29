// A constant holding all possible transition/animation end event names for cross-browser compatibility.
const END_TRANSITION = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd';

class Transitions {
    constructor(options) {
        const defaults = {
            onScreenClass: '',
            offScreenClass: '',
            hiddenClass: 'out',
            animateClass: 'animated',
            inDuration: null,
            outDuration: null,
            parentNode: null,
        };

        // Use modern spread syntax to merge options with defaults.
        this.opt = {...defaults, ...options};

        // Ensure parentNode exists before proceeding
        if (!this.opt.parentNode) {
            console.error('Transitions: parentNode is not defined.');
            return;
        }

        this.opt.insertTimeout = this.getInsertTimeout();
        this.opt.removeTimeout = this.getRemoveTimeout();

        // Attach the UI hooks to the parent DOM element for Blaze to use.
        this.opt.parentNode._uihooks = this.createHooks();

        this.setupStyles();

        // Handle elements that are already on the page when this is initialized.
        $(this.opt.parentNode).find('.animated.out').each((index, item) => {
            this.insertElement(item, null);
        });
    }

    /**
     * Creates the _uihooks object for Blaze.
     * Arrow functions are used to ensure 'this' is correctly bound to the class instance.
     * @returns {{insertElement: (function(*, *): void), removeElement: (function(*): void)}}
     */
    createHooks() {
        return {
            insertElement: (node, next) => this.insertElement(node, next),
            removeElement: (node) => this.removeElement(node),
        };
    }

    /**
     * Determines the timeout for insert animations based on class name or explicit duration.
     * @returns {number} Timeout in milliseconds.
     */
    getInsertTimeout() {
        if (this.opt.inDuration) return parseInt(this.opt.inDuration, 10);

        switch (this.opt.onScreenClass) {
            case 'hinge':
                return 2000;
            case 'bounceIn':
                return 750;
            default:
                return 1000;
        }
    }

    /**
     * Determines the timeout for remove animations based on class name or explicit duration.
     * @returns {number} Timeout in milliseconds.
     */
    getRemoveTimeout() {
        if (this.opt.outDuration) return parseInt(this.opt.outDuration, 10);

        switch (this.opt.offScreenClass) {
            case 'hinge':
                return 2000;
            case 'bounceOut':
                return 750;
            case 'flipOutX':
                return 750;
            case 'flipOutY':
                return 750;
            default:
                return 1000;
        }
    }

    /**
     * The hook Blaze calls to insert an element into the DOM with animations.
     * @param {HTMLElement} node - The element being inserted.
     * @param {HTMLElement} next - The element that the new node should be inserted before.
     */
    insertElement(node, next) {
        const $node = $(node);

        $node.addClass(`${this.opt.animateClass} ${this.opt.hiddenClass}`).attr('hidden', true);
        $(next).before($node);

        const finish = () => {
            $node.removeClass(this.opt.onScreenClass);
            node.setAttribute('inserting', 'false');
        };

        const insert = () => {
            // Trigger a reflow to ensure the initial state is rendered before animating.
            $node.width();
            $node.attr('hidden', false).removeClass(this.opt.hiddenClass).addClass(this.opt.onScreenClass);
            $node.one(END_TRANSITION, finish);
        };

        // If an element is being removed, wait for it to finish before inserting the new one.
        if (this.removing) {
            Meteor.setTimeout(insert, this.opt.removeTimeout);
        } else {
            insert();
        }
    }

    /**
     * The hook Blaze calls to remove an element from the DOM with animations.
     * @param {HTMLElement} node - The element being removed.
     */
    removeElement(node) {
        const $node = $(node);

        const remove = () => {
            this.removing = false;
            $node.remove();
        };

        if (this.opt.offScreenClass) {
            $node.addClass(`${this.opt.animateClass} ${this.opt.offScreenClass}`);
            this.removing = true;
            $node.one(END_TRANSITION, remove);
        } else {
            remove();
        }
    }

    /**
     * Injects a <style> tag to override animation durations if specified.
     */
    setupStyles() {
        if (this.opt.inDuration || this.opt.outDuration) {
            const randName = `${this.opt.onScreenClass}${Math.floor(Math.random() * 1001)}`;
            const $styleInjection = $('<style></style>');
            const $parentNode = $(this.opt.parentNode);

            $parentNode.addClass(randName);

            let styles = '';
            if (this.opt.inDuration) {
                styles += `.${randName} .animated.${this.opt.onScreenClass} { -webkit-animation-duration: ${this.opt.inDuration}ms; animation-duration: ${this.opt.inDuration}ms; }`;
            }
            if (this.opt.outDuration) {
                styles += `.${randName} .animated.${this.opt.offScreenClass} { -webkit-animation-duration: ${this.opt.outDuration}ms; animation-duration: ${this.opt.outDuration}ms; }`;
            }

            $styleInjection.html(styles);
            $parentNode.append($styleInjection);
        }
    }
}

Template.transition.onRendered(function () {
    const data = this.data || {};

    // Parse transition names and optional durations (e.g., "bounceIn:500").
    const transitionIn = data.in?.match(/^(.*):/)?.[1] || data.in;
    const transitionOut = data.out?.match(/^(.*):/)?.[1] || data.out;
    const inDuration = data.in?.match(/:(\d*)/)?.[1];
    const outDuration = data.out?.match(/:(\d*)/)?.[1];

    let parentNode;
    const $firstDirectChild = this.$('>').first();

    // Use a dedicated wrapper div if it exists, otherwise use the template's parent node.
    if ($firstDirectChild.hasClass('transition-wrapper')) {
        parentNode = $firstDirectChild[0];
    } else {
        parentNode = this.firstNode?.parentNode;
    }

    const params = {
        onScreenClass: transitionIn,
        offScreenClass: transitionOut,
        inDuration,
        outDuration,
        parentNode,
    };

    // The instance attaches its hooks to the DOM element itself.
    new Transitions(params);
});

Template.transition.onDestroyed(function () {
    // Clean up the hooks when the template is destroyed to prevent memory leaks.
    if (this.firstNode?.parentNode?._uihooks) {
        this.firstNode.parentNode._uihooks = null;
    }
});
