(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayTrackBy', DoorayTrackBy);

    /* @ngInject */
    function DoorayTrackBy($animate) {
        return {
            multiElement: true,
            transclude: 'element',
            priority: 500,
            terminal: true,
            restrict: 'A',
            $$tlb: true,
            link: function (scope, element, attrs, ctrl, $transclude) {
                // ngIf directive 참고
                var block, childScope, previousElements;
                var cleanWatchHandler = scope.$watch(attrs.doorayTrackBy, function (value) {
                    if (value) {
                        if (previousElements) {
                            previousElements.remove();
                            previousElements = null;
                        }
                        if (childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }
                        if (block) {
                            previousElements = getBlockNodes(block.clone);
                            $animate.leave(previousElements).then(function() {
                                previousElements = null;
                            });
                            block = null;
                        }

                        $transclude(function(clone, newScope) {
                            childScope = newScope;
                            // Note: We only need the first/last node of the cloned nodes.
                            // However, we need to keep the reference to the jqlite wrapper as it might be changed later
                            // by a directive with templateUrl when its template arrives.
                            block = {
                                clone: clone
                            };
                            $animate.enter(clone, element.parent(), element);
                        });
                    }
                });

                scope.$on('$destroy', function () {
                    cleanWatchHandler();
                });
            }
        };

        function getBlockNodes(nodes) {
            var node = nodes[0];
            var endNode = nodes[nodes.length - 1];
            var blockNodes;

            for (var i = 1; node !== endNode && (node = node.nextSibling); i++) {
                if (blockNodes || nodes[i] !== node) {
                    if (!blockNodes) {
                        blockNodes = jqLite(slice.call(nodes, 0, i));
                    }
                    blockNodes.push(node);
                }
            }

            return blockNodes || nodes;
        }
    }

})();
