/**
 * ROD AND FRAME TASK
 *
 * This plugin uses fabric.js to draw a rod and frame task with certain specifications onto a canvas
 * Compatible with jsPsych 6.2.0
 *
 * @author Felix Schweigkofler
 **/


jsPsych.plugins["rod-and-frame-task"] = (function() {

    var plugin = {};
    // INFO CODE OF PLUG IN
    // contains parameters of the CRAF-task with default-settings
    plugin.info = {
        name: 'rod and frame task',
        description: 'Uses fabric.js to implement the rod and frame task',
        parameters: {

            prompt: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any information that should be displayed below the task itself'
            },
            rod_or_dots: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Rod or dots',
                default: "dots",
                description: 'Whether the task should use an actual rod as rod or dots along a hypothetical rod to remove hints by pixelation of the rod, especially with low-resolution-screens'
            },
            frame_dims: {
                type: jsPsych.plugins.parameterType.INT,
                array: true,
                pretty_name: 'Frame dimensions',
                default: undefined,
                description: 'The dimensions of the squared frame in px'
            },
            frame_angle:{
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Frame angle',
                default: undefined,
                description: 'The angle of the frame as seen from unit circle in degrees (up = 90°)'
            },
            frame_stroke: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Frame stroke thickness',
                default: 4,
                description: 'The thickness of the frame stroke in px'// in px?
            },
            rod_length: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Rod length',
                default: undefined,
                description: 'The length of the (hypothetical) rod in px'
            },
            rod_starting_angle: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Rod starting angle',
                default: undefined,
                description: 'The starting angle of the hypothetical rod in degrees in the unit circle (0° right, 90° top, 180° left, 270° bottom)'
            },
            rotation_step: {
                type: jsPsych.plugins.parameterType.FLOAT,
                pretty_name: 'Rotation step',
                default: 0.2,
                description: 'How many degrees one keypress rotates the rod'
            },
            rod_stroke: {
                type: jsPsych.plugins.parameterType.FLOAT,
                pretty_name: 'Rod thickness',
                default: 8,
                description: 'The thickness of the rod or the diameter of the dots in px'
            },
            circle_col: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Circle colour',
                default: 'black',
                description: "The colour of the background circle as a string. If there should be no circle, type 'transparent'"
            },
            rod_col: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Rod colour',
                default: 'white',
                description: "The colour of the rod or dots"
            },
            frame_col: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Frame colour',
                default: 'white',
                description: "The colour of the frame. If there should be no frame, type 'transparent'"
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                array: true,
                pretty_name: 'Choices',
                default: [69, 73, 32],
                description: 'The first key rotates the rod clockwise, the second key rotates the rod counterclockwise, the third key ends the trial (JavaScript keycode)'
            },
            break_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Break duration',
                default: null,
                description: 'Time in ms until the next frame and rod/dots are presented, while the background circle stays visible'
            },
            min_input: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Minimum input to proceed',
                default: 'true',
                description: 'The rod needs to be turned at least one step in order to proceed to the next trial. Turn off with "false". May lead to participants accidentally jumping trials by pressing the proceed-key during a break'
            },
            target_angle: {
                type: jsPsych.plugins.parameterType.FLOAT,
                pretty_name: 'Target angle',
                default: 90,
                description: 'Target angle of the rod in the unit circle, vertical is 90°, horizontal is 180°'
            },
        }
    }

    // MAIN CODE OF PLUG IN
    plugin.trial = function(display_element, trial) {

//__Stimulus setup______________________________________________________________________________________________________

        // define parameters
        var frame_diag = Math.sqrt(2* trial.frame_dims*trial.frame_dims) // diagonal of the frame is calculation basis for others
        var canvaswidth = 1.101* frame_diag;    // width and height of the canvas are chosen in a way that the frame can certainly fit onto it, even when turned 45° and a thick stroke. The canvas could also be made as large as the whole window is
        var canvasheight = 1.101* frame_diag;
        var circle_radius = 0.55* frame_diag; // the background circle will be as large as the canvas is (minimally smaller so that the circle isn't cut off by the canvas ad the edges)
        var canvas_center_X = canvaswidth/2;  // the center of the canvas is set
        var canvas_center_Y = canvasheight/2;
        var rod_radius = trial.rod_length/2;  // radius of the unit circle the rod moves in
        var rod_angle = trial.rod_starting_angle; // set the angle counter to the starting position the rod has in the present trial (based on unit circle)
        var NOA = 0; // number of adjustments the pp makes in the present trial

        // function used to convert the degrees into radians for Math.sin/Math.cos
        function deg2rad(degrees){
            var pi = Math.PI;
            return degrees * (pi/180);
        }

        // create the HTML that will be displayed
        var new_html = ''
        // add a canvas object to the HTML
        new_html += '<canvas id="CRAF-canvas"></canvas>'
        // add the prompt to the HTML if a prompt was defined by user
        if(trial.prompt !== null){
            new_html += trial.prompt
        }

        // display this HTML
        display_element.innerHTML = new_html

        // give the canvas properties and refresh it
        const canvas = new fabric.Canvas("CRAF-canvas", { // accessing the canvas object with fabric
            width: canvaswidth,
            height: canvasheight,
            backgroundColor: "white",
            hoverCursor: "none" // the mouse cursor will not be visible on the canvas
        });
        canvas.renderAll()



        // creating the items on the canvas with fabric.js
        // IMPORTANT: the order of the items is important, since it will determine what lays above what and the order of the items in the array when they are called to be moved (e.g. canvas.item(1).set)

        // create a circle (item[0]) (must be first so that it is in background)
        const item_circle = new fabric.Circle({
            originX: "center",
            originY: "center",
            left: canvas_center_X,
            top: canvas_center_Y,
            fill: trial.circle_col,
            radius: circle_radius,
            selectable: false,
            objectCaching: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasControls: false,
            hasBorders: false
        });

        // create the dots (items[1][2][3][4][5]) or the rod (item[1])
        if (trial.rod_or_dots.toLowerCase() === "dots"){
            var item_dot1 = new fabric.Circle({
                originX: "center",
                originY: "center",
                left: canvas_center_X + (rod_radius)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                top: canvas_center_Y - (rod_radius)*Math.sin(deg2rad(rod_angle)),
                fill: trial.rod_col,
                radius: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
            var item_dot2 = new fabric.Circle({
                originX: "center",
                originY: "center",
                left: canvas_center_X - (rod_radius)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px
                top: canvas_center_Y + (rod_radius)*Math.sin(deg2rad(rod_angle)),
                fill: trial.rod_col,
                radius: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
            var item_dot3 = new fabric.Circle({
                originX: "center",
                originY: "center",
                left: canvas_center_X + (rod_radius/2)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px
                top: canvas_center_Y - (rod_radius/2)*Math.sin(deg2rad(rod_angle)),
                fill: trial.rod_col,
                radius: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
            var item_dot4 = new fabric.Circle({
                originX: "center",
                originY: "center",
                left: canvas_center_X - (rod_radius/2)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px
                top: canvas_center_Y + (rod_radius/2)*Math.sin(deg2rad(rod_angle)),
                fill: trial.rod_col,
                radius: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
            var item_dot5 = new fabric.Circle({
                originX: "center",
                originY: "center",
                left: canvas_center_X + (rod_radius/4)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px
                top: canvas_center_Y - (rod_radius/4)*Math.sin(deg2rad(rod_angle)),
                fill: trial.rod_col,
                radius: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
            var item_dot6 = new fabric.Circle({
                originX: "center",
                originY: "center",
                left: canvas_center_X - (rod_radius/4)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px
                top: canvas_center_Y + (rod_radius/4)*Math.sin(deg2rad(rod_angle)),
                fill: trial.rod_col,
                radius: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
            var item_dot7 = new fabric.Circle({
                originX: "center",
                originY: "center",
                left: canvas_center_X + (rod_radius/(4/3))*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px
                top: canvas_center_Y - (rod_radius/(4/3))*Math.sin(deg2rad(rod_angle)),
                fill: trial.rod_col,
                radius: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
            var item_dot8 = new fabric.Circle({
                originX: "center",
                originY: "center",
                left: canvas_center_X - (rod_radius/(4/3))*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px
                top: canvas_center_Y + (rod_radius/(4/3))*Math.sin(deg2rad(rod_angle)),
                fill: trial.rod_col,
                radius: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
            var item_dot9 = new fabric.Circle({
                originX: "center",
                originY: "center",
                left: canvas_center_X, // the unit circle has a radius of 100 px
                top: canvas_center_Y,
                fill: trial.rod_col,
                radius: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
        } else if (trial.rod_or_dots.toLowerCase() === "rod"){
            var item_line = new fabric.Line([
                canvas_center_X + (rod_radius)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                canvas_center_Y - (rod_radius)*Math.sin(deg2rad(rod_angle)),
                canvas_center_X - (rod_radius)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px
                canvas_center_Y + (rod_radius)*Math.sin(deg2rad(rod_angle)),
            ],{
                originX: "center",
                originY: "center",
                stroke: trial.rod_col,
                strokeWidth: trial.rod_stroke/2,
                selectable: false,
                objectCaching: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasControls: false,
                hasBorders: false
            });
        }

        // create the frame (item[2] in case of "rod" and item[6] in case of "dots")
        const item_frame = new fabric.Rect({
            originX: "center",
            originY: "center",
            left: canvas_center_X,
            top: canvas_center_Y,
            width: trial.frame_dims,
            height: trial.frame_dims,
            angle: trial.frame_angle,
            fill: "transparent",
            stroke: trial.frame_col,
            strokeWidth: trial.frame_stroke,
            selectable: false,
            objectCaching: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasControls: false,
            hasBorders: false
        });

        // add them to canvas and refresh canvas
        if (trial.rod_or_dots.toLowerCase() === "dots"){
            canvas.add(item_circle, item_dot1, item_dot2, item_dot3, item_dot4, item_dot5, item_dot6 ,item_dot7 ,item_dot8 ,item_dot9, item_frame)
        } else if (trial.rod_or_dots.toLowerCase() === "rod"){
            canvas.add(item_circle, item_line, item_frame)
        }

        canvas.renderAll()

//__User interaction____________________________________________________________________________________________________
        // (0) create response.rt, jsPsych uses it to calculate the reaction time as output_data
        var response = {
            rt: null,
        };

        // (3) function to end trial when it is time (called by after_response)
        var end_trial = function() {

            // calculate the minimum number of adjustments that would have been needed to be made to reach 90° (vertical) (ideal participant)
            var min_NOA = Math.abs(trial.rod_starting_angle - trial.target_angle) / trial.rotation_step
            // calculate the minimum number of adjustments that would have needed to be made to reach the participants end position (did the participant jump back and forth or did they go straight to their end position)
            var min_NOA_p = Math.abs(trial.rod_starting_angle - rod_angle) / trial.rotation_step

            // calculate the error
            var error = rod_angle - trial.target_angle
            // the error needs to be adjusted to the fact that free turning is possible and the rod_angle can be more than 360°
            // if the error is larger than 360° (participant turning it full circle, which would appear as large error)
            if(error > 360){
                // remove the additional turns from the error
                error -= 360*Math.floor(error/360)
            }
            // if the error is still larger than 180°
            if(error > 180){
                // remove the overshoot from the error, since 0° and 180° and 360° are all correct
                error -= 180
            }
            // if the error is still larger than 90°
            if(error > 90){
                // remove the overshoot from the error, since due to both ends of the rod being identical, the final position cannot ever be judged as more than 90° off
                error -= 180
            }
            // the parameter rod_angle will still contain the information whether the participant turned the rod a lot, but the error variable will only contain the task-relevant error


            // gather the data to store for the trial
            var trial_data = {
                "rt": response.rt,
                "responseError": error,
                "rod_final_angle": rod_angle,
                "rod_starting_angle": trial.rod_starting_angle,
                "frame_angle": trial.frame_angle,
                "NOA": NOA,
                "min_NOA": min_NOA,
                "min_NOA_participant": min_NOA_p
            };

            // clear the display
            display_element.innerHTML = '';

            // pass data to jsPsych and move on to next trial with the jsPsych-function finishTrial
            jsPsych.finishTrial(trial_data);
        };



        // (2) function to handle responses by the subject (called by keyboardlistner)
        var after_response = function(info) {

            // if rotation keys were pressed, update the angle to new the angle
            if (event.keyCode === trial.choices[0]||event.keyCode === trial.choices[1]){
                if (event.keyCode === trial.choices[0]){
                    rod_angle += trial.rotation_step
                } else {
                    rod_angle -= trial.rotation_step
                }

                // if the rod is made up of dots, update position of dots
                if (trial.rod_or_dots.toLowerCase() === "dots"){
                    canvas.item(1).set({
                        left: canvas_center_X - rod_radius*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                        top: canvas_center_Y + rod_radius*Math.sin(deg2rad(rod_angle)),
                    })
                    canvas.item(2).set({
                        left: canvas_center_X + rod_radius*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                        top: canvas_center_Y - rod_radius*Math.sin(deg2rad(rod_angle)),
                    })
                    canvas.item(3).set({
                        left: canvas_center_X + rod_radius/2*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                        top: canvas_center_Y - rod_radius/2*Math.sin(deg2rad(rod_angle)),
                    })
                    canvas.item(4).set({
                        left: canvas_center_X - rod_radius/2*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                        top: canvas_center_Y + rod_radius/2*Math.sin(deg2rad(rod_angle)),
                    })
                    canvas.item(5).set({
                        left: canvas_center_X + rod_radius/4*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                        top: canvas_center_Y - rod_radius/4*Math.sin(deg2rad(rod_angle)),
                    })
                    canvas.item(6).set({
                        left: canvas_center_X - rod_radius/4*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                        top: canvas_center_Y + rod_radius/4*Math.sin(deg2rad(rod_angle)),
                    })
                    canvas.item(7).set({
                        left: canvas_center_X + rod_radius/(4/3)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                        top: canvas_center_Y - rod_radius/(4/3)*Math.sin(deg2rad(rod_angle)),
                    })
                    canvas.item(8).set({
                        left: canvas_center_X - rod_radius/(4/3)*Math.cos(deg2rad(rod_angle)), // the unit circle has a radius of 100 px, i.e. 1/4 of canvas.
                        top: canvas_center_Y + rod_radius/(4/3)*Math.sin(deg2rad(rod_angle)),
                    })
                // else if the rod is a normal rod, update the endpoints of the line to change it's angle
                } else if (trial.rod_or_dots.toLowerCase() === "rod") {
                    canvas.item(1).set({
                        // endpoint one
                        x1: canvas_center_X - rod_radius*Math.cos(deg2rad(rod_angle)),
                        y1: canvas_center_Y + rod_radius*Math.sin(deg2rad(rod_angle)),
                        // endpoint two
                        x2: canvas_center_X + rod_radius*Math.cos(deg2rad(rod_angle)),
                        y2: canvas_center_Y - rod_radius*Math.sin(deg2rad(rod_angle)),
                    })
                }

                //refresh the canvas, and update the NOA
                canvas.renderAll()
                NOA++

            // else if the "end-trial-key" was pressed
            } else if (event.keyCode === trial.choices[2]) {

                // if the minimum_input is enabled and no rotation key was pressed yet in this trial
                if (trial.min_input === "true" & NOA === 0){
                    // don't proceed (do nothing)

                // else proceed with ending the trial and going to next trial:
                } else {

                    // set response parameters to the info parameters (i.e. the time from start of trial until here = RT)
                    response = info;

                    // if a break before the next trial is defined
                    if (trial.break_duration !== null) {

                        // kill keyboard listener so that no further input is possible
                        if (typeof keyboardListener !== 'undefined') {
                            jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                        }

                        // draw a new circle with the same properties as the background circle on top of the other canvas elements to hide them
                        var item_endcircle = new fabric.Circle({
                            originX: "center",
                            originY: "center",
                            left: canvas_center_X,
                            top: canvas_center_Y,
                            fill: trial.circle_col,
                            radius: circle_radius,
                            selectable: false,
                            objectCaching: false,
                            lockMovementX: true,
                            lockMovementY: true,
                            lockScalingX: true,
                            lockScalingY: true,
                            lockRotation: true,
                            hasControls: false,
                            hasBorders: false
                        });
                        canvas.add(item_endcircle)
                        canvas.renderAll()

                        // delay the calling of the end_trial function for the duration of the break
                        jsPsych.pluginAPI.setTimeout(function() {
                            end_trial(); // call the end_trial function
                        }, trial.break_duration);

                    // else if there is no break time set
                    } else {
                        // kill keyboard listener
                        if (typeof keyboardListener !== 'undefined') {
                            jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                        }
                        // call the end_trial function
                        end_trial()
                    }
                }
            }
        };

        // (1) start the response listener
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: trial.choices, // the valid responses for the keyboardListener are the choices defined on top
            rt_method: 'performance',
            persist: true, // because this listener needs to react to all responses and not only the first one, jsPsych would otherwise turn it off after the first input
            allow_held_key: true // allows the participant to keep the key pressed to rotate more quickly, jsPsych would otherwise require a single press for every single stimulus
        });
    };

    return plugin;
})();
