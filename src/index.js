
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

/**
 * SAFETY PATCH (Expo SDK 53 / RN 0.79 / React 19)
 * - Remove deprecated ViewPropTypes (can crash during import).
 * - Add defensive defaults for style props.
 * - Normalize style props to avoid accessing `.style` on undefined.
 */

const safeStyle = (s) => (s == null ? undefined : s);

export default class SelectionGroup extends React.Component {
  render() {
    const {
      items,
      onPress,
      isSelected,
      containerStyle,
      renderContent,
      onItemSelected,
      getAllSelectedItemIndexes,
      onItemDeselected,
      ...attributes
    } = this.props;

    /**
     * forceUpdate is called below to ensure a re-render happens, in case for whatever reason
     * the client of this component doesn't take any action that forces a redraw.
     * This is actually super inefficent code, all elements are redrawn when any single element is touched.
     */
    return (
      <View style={safeStyle(containerStyle)} {...attributes}>
        {items.map((item, i) =>
          renderContent(
            item,
            i,
            isSelected(i),
            () => {
              onPress(i);
              this.forceUpdate();
              if (isSelected(i)) {
                if (onItemSelected) {
                  const selectedItems = [];
                  if (getAllSelectedItemIndexes) {
                    const selectedItemIndexes = getAllSelectedItemIndexes();
                    if (selectedItemIndexes != null) {
                      for (const index of selectedItemIndexes) {
                        selectedItems.push(items[index]);
                      }
                    }
                  }
                  onItemSelected(item, selectedItems);
                }
              } else if (onItemDeselected) {
                const selectedItems = [];
                if (getAllSelectedItemIndexes) {
                  const selectedItemIndexes = getAllSelectedItemIndexes();
                  if (selectedItemIndexes != null) {
                    for (const index of selectedItemIndexes) {
                      selectedItems.push(items[index]);
                    }
                  }
                }
                onItemDeselected(item, selectedItems);
              }
            }
          )
        )}
      </View>
    );
  }
}

export class SelectionHandler {
  constructor(options = { maxMultiSelect: 1, allowDeselect: true, defaultSelection: null }) {
    this.selectedOption = options.defaultSelection !== undefined ? options.defaultSelection : null; // An array if maxSelected > 1
    this.maxSelected = options.maxMultiSelect !== undefined ? options.maxMultiSelect : 1;
    this.allowDeselect = options.allowDeselect !== undefined ? options.allowDeselect : true;
  }

  getAllSelectedItemIndexes = () => {
    return this.selectedOption;
  };

  selectionHandler = (index) => {
    if (this.maxSelected === 1 && index === this.selectedOption && this.allowDeselect) {
      this.selectedOption = null;
    } else if (this.maxSelected > 1 && this.selectedOption && this.selectedOption.includes(index) && this.allowDeselect) {
      this.selectedOption.splice(this.selectedOption.indexOf(index), 1);
    } else if (this.maxSelected === 1) {
      this.selectedOption = index;
    } else if (this.selectedOption) {
      this.selectedOption.push(index);
      if (this.selectedOption.length > this.maxSelected) this.selectedOption.shift();
    } else {
      this.selectedOption = [index];
    }
  };

  isSelected = (index) => {
    if (this.selectedOption === null) return false;
    if (typeof this.selectedOption === 'number') return index === this.selectedOption;
    return this.selectedOption.includes(index);
  };
}

SelectionGroup.propTypes = {
  items: PropTypes.array.isRequired,
  onPress: PropTypes.func.isRequired,
  isSelected: PropTypes.func.isRequired,
  isDeselected: PropTypes.func,
  containerStyle: PropTypes.any, // was ViewPropTypes.style
  renderContent: PropTypes.func.isRequired,
  onItemSelected: PropTypes.func,
  getAllSelectedItemIndexes: PropTypes.func,
  attributes: PropTypes.any,
};

SelectionGroup.defaultProps = {
  containerStyle: undefined,
};
