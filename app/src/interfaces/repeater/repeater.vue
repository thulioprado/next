<template>
	<v-item-group class="repeater" v-model="selection">
		<interface-code v-if="viewRaw" v-model="rawValue" />
		<draggable v-else :value="value" handle=".drag-handle" @input="onSort" :set-data="hideDragImage">
			<repeater-row
				v-for="(row, index) in value"
				:key="index"
				:value="row"
				:template="template"
				:fields="fields"
				@input="updateValues(index, $event)"
				@delete="removeItem(row)"
				:disabled="disabled"
			/>
		</draggable>
		<div class="actions">
			<button @click="addNew" class="button add-new" v-if="showAddNew">
				<v-icon name="add" />
				{{ addLabel }}
			</button>
			<v-switch
				v-model="viewRaw"
				class="button"
				v-if="rawEditable"
				:label="$t('interfaces.repeater.edit_raw')"
			></v-switch>
		</div>
	</v-item-group>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from '@vue/composition-api';
import RepeaterRow from './repeater-row.vue';
import { Field } from '@/types';
import Draggable from 'vuedraggable';
import i18n from '@/lang';
import hideDragImage from '@/utils/hide-drag-image';

export default defineComponent({
	components: { RepeaterRow, Draggable },
	props: {
		value: {
			type: Array,
			default: null,
		},
		fields: {
			type: Array as PropType<Partial<Field>[]>,
			default: () => [],
		},
		template: {
			type: String,
			required: true,
		},
		addLabel: {
			type: String,
			default: i18n.t('add_a_new_item'),
		},
		limit: {
			type: Number,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		rawEditable: {
			type: Boolean,
			default: false,
		},
	},
	setup(props, { emit }) {
		const selection = ref<number[]>([]);
		const viewRaw = ref(false);

		const rawValue = computed({
			get() {
				return JSON.stringify(props.value, null, 4);
			},
			set(val: string) {
				try {
					emit('input', JSON.parse(val));
				} catch (e) {}
			},
		});

		const showAddNew = computed(() => {
			if (props.disabled) return false;
			if (props.value === null) return true;
			if (props.limit === null) return true;
			if (Array.isArray(props.value) && props.value.length < props.limit) return true;
			return false;
		});

		return { updateValues, onSort, removeItem, addNew, showAddNew, hideDragImage, selection, viewRaw, rawValue };

		function updateValues(index: number, updatedValues: any) {
			emit(
				'input',
				props.value.map((item, i) => {
					if (i === index) {
						return updatedValues;
					}

					return item;
				})
			);
		}

		function onSort(sortedItems: any[]) {
			emit('input', sortedItems);
		}

		function removeItem(row: any) {
			selection.value = [];
			if (props.value) {
				emit(
					'input',
					props.value.filter((existingItem) => existingItem !== row)
				);
			} else {
				emit('input', null);
			}
		}

		function addNew() {
			const newDefaults: any = {};

			props.fields.forEach((field) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				newDefaults[field.field!] = field.schema?.default_value;
			});

			// select the new row
			selection.value = [props.value?.length || 0];

			if (props.value !== null) {
				emit('input', [...props.value, newDefaults]);
			} else {
				emit('input', [newDefaults]);
			}
		}
	},
});
</script>

<style lang="scss" scoped>
.actions {
	display: flex;
	justify-content: space-between;
	margin-top: 8px;

	.button {
		display: flex;
		width: 50%;
		height: 48px;
		margin-right: 8px;
		padding: 10px; // 10 not 12, offset for border
		color: var(--foreground);
		border: 2px solid var(--border-normal);
		border-radius: var(--border-radius);
		transition: var(--fast) var(--transition);
		transition-property: color, border-color;

		&:last-child {
			margin-right: 0;
		}

		&:hover {
			color: var(--primary);
			border-color: var(--primary);
		}

		.v-icon {
			margin-right: 8px;
		}
	}

	.add-new {
		align-items: center;
		width: 100%;
		color: var(--foreground-subdued);
		border: 2px dashed var(--border-normal);
		border-radius: var(--border-radius);
	}
}
</style>
