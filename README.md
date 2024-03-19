# rod-and-frame-jsPsych-plugin
A java script plugin creating rod-and-frame trials to be used within the jsPsych framework.
The rod-and-frame task is used to determine a person's field dependence i.e., whether and how much the ability to correctly judge the property of a stimulus (the rod) is influenced by the "field" (the frame) in which it is embedded.
# Dependencies
Requires fabric.min.js to draw on the js canvas
# Compatibility
This plugin was written for jsPsych 6.2.0. Compatibility with 6.x is not guaranteed. Not compatible with 7.0.0 or higher.
# Parameters
The plugin accepts the following parameters:
Parameter | Type | Default Value | Description
----------|------|---------------|------------
promt | STRING | undefined | Any information that should be displayed below the task itself
rod_or_dots | STRING | dots | Whether the task should use an actual rod as rod or dots along a hypothetical rod to remove hints by pixelation of the rod, especially with low-resolution-screens
frame_dims | INT | undefined | The dimensions of the squared frame in px
frame_angle | INT | unedfined | The angle of the frame as seen from unit circle in degrees (up = 90°)
frame_stroke | INT | 4 | The thickness of the frame stroke in px
rod_length | INT | undefined | The length of the (hypothetical) rod in px
rod_starting_angle | INT | undefined | The starting angle of the hypothetical rod in degrees in the unit circle (0° right, 90° top, 180° left, 270° bottom)
rotation_step | FLOAT | 0.2 | How many degrees one keypress rotates the rod
rod_stroke | FLOAT | 8 | The thickness of the rod or the diameter of the dots in px
circle_col | STRING | black | The colour of the background circle as a string. If there should be no circle, type 'transparent'
rod_col | STRING | white | The colour of the rod or dots
frame_col | STRING | white | The colour of the frame. If there should be no frame, type 'transparent'
choices | KEYCODE | 69,73,32 (i,e,space) | The first key rotates the rod clockwise, the second key rotates the rod counterclockwise, the third key ends the trial (JavaScript keycode)
break_duration | INT | null | Time in ms until the next frame and rod/dots are presented, while the background circle stays visible
min_input | STRING | true | The rod needs to be turned at least one step in order to proceed to the next trial. Turn off with "false". May lead to participants accidentally jumping trials by pressing the proceed-key during a break
target_angle | FLOAT | 90 | Target angle of the rod in the unit circle, vertical is 90°, horizontal is 180°
