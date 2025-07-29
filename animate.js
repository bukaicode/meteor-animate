Template.animate.onRendered(function () {
    // 'this' refers to the template instance.
    const $node = this.$('>').first();
    const data = this.data || {};

    // Get animation type from data context, or default to 'bounce'.
    const animation = data.type || 'bounce';

    // Get delay from data context, or default to 200ms.
    const delay = data.delay ? parseInt(data.delay, 10) : 200;

    // Arrow function to add the animation classes.
    const animate = () => {
        // Use a template literal for clean string formatting.
        $node.addClass(`animated ${animation}`);
    };

    // Set a timeout for the animation if a delay is provided.
    if (delay) {
        Meteor.setTimeout(animate, delay);
    } else {
        animate();
    }
});
