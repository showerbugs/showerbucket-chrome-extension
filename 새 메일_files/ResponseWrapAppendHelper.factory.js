(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('ResponseWrapAppendHelper', ResponseWrapAppendHelper);

    /* @ngInject */
    function ResponseWrapAppendHelper(_) {
        return {
            create : function(result, header){
                var contents = result && (result.contents || result.content);
                if (!contents) {//POST, PUT, DELETE 의 응답값에는 result === null 이거나 contents|content 가 존재하지 않음
                    return {
                        _data: {
                            _header: header,
                            _result: result
                        },
                        header: function () {
                            return header;
                        },
                        result: function () {
                            return this._data._result;
                        }
                    };
                }
                var references = result.references,
                    bArray = _.isArray(result.contents),
                    refMap = {},
                    editReferences = makeEditReferences(references);

                if (bArray) {
                    _.forEach(contents, function (content) {
                        assignWrap(content, refMap, editReferences);
                    });
                } else {
                    assignWrap(contents, refMap, editReferences);
                }

                assignRefMap(references, refMap);

                return {
                    _data: {
                        _header: header,
                        _result: result,
                        _contents : contents
                    },
                    header: function () {
                        return header;
                    },
                    result: function () {
                        return this._data._result;
                    },
                    contents: function () {
                        return this._data._contents;
                    },
                    totalCount: function () {
                        return this._data._result.totalCount;
                    },
                    isArray: function () {
                        return _.isArray(this._data._contents);
                    },
                    get: function (key) { //array일 경우 index
                        return this.isArray()? this._data._contents[key]: _.get(this._data._contents, key);
                    },
                    references: function () {
                        return references;
                    },
                    refMap: refMap,
                    editReferences: editReferences
                };
            },
            assignWrap: assignWrap //item._wrap.refMap.*Map(key)의 리턴 객체에 refMap을 재할당할 필요성
        };

        function assignWrap(content, refMap, editReferences) {
            content._getOrSetProp  = function (key, value) {
                return getOrSetProp(this, key, value);
            };

            content._wrap = {
                refMap: refMap,
                editReferences: editReferences
            };
            return content;
        }

        function getOrSetProp(content, key, value) {
            if (_.isUndefined(value)) {
                return _.get(content, '_props.' + key);
            }
            _.set(content, '_props.' + key, value);
        }

        function assignRefMap(references, refMap) {
            _.forEach(references, function (mapObj, mapName) {
                refMap[mapName] = function (key) {
                    return _.isUndefined(key) ? mapObj : mapObj[key];
                };
            });
        }

        function makeEditReferences(references) {
            // references의 map에 값을 수정하기 위한 함수
            return function (mapName, callback) {
                callback(references[mapName], references);
            };
        }
    }

})();
