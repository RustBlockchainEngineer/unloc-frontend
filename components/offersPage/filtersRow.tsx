import { useCallback, useContext, useRef } from "react";

import { observer } from "mobx-react";

import { Filter } from "@components/filters/filter";
import { CustomMultiSelect } from "@components/layout/customMultiSelect";
import { CustomSelect } from "@components/layout/customSelect";
import { StoreContext } from "@pages/_app";

export const FiltersRow = observer(() => {
  const store = useContext(StoreContext);
  const amountMinRef = useRef<HTMLInputElement>(null);
  const amountMaxRef = useRef<HTMLInputElement>(null);
  const aprMinRef = useRef<HTMLInputElement>(null);
  const aprAprMax = useRef<HTMLInputElement>(null);
  const durationMinRef = useRef<HTMLInputElement>(null);
  const durationMaxRef = useRef<HTMLInputElement>(null);

  const {
    filterCollection,
    filterCollectionSelected,
    filterAprMin,
    filterAprMax,
    filterAmountMin,
    filterAmountMax,
    filterDurationMin,
    filterDurationMax,
    filterCurrency,
    viewType,
    filtersVisible,
    clearFilters,
  } = store.Offers;

  const { theme } = store.Interface;

  const switchCurrency = (currency: string): void => {
    store.Offers.setFilterCurrency(currency);
  };

  const resetFilters = useCallback((): void => {
    clearFilters();
    if (amountMinRef.current) amountMinRef.current.value = "";
    if (amountMaxRef.current) amountMaxRef.current.value = "";
    if (aprMinRef.current) aprMinRef.current.value = "";
    if (aprAprMax.current) aprAprMax.current.value = "";
    if (durationMinRef.current) durationMinRef.current.value = "";
    if (durationMaxRef.current) durationMaxRef.current.value = "";
  }, [amountMinRef, amountMaxRef, aprMinRef, aprAprMax, durationMinRef, durationMaxRef]);

  return (
    <div className="layout-line">
      <div className={`offers-filters-wrapper ${filtersVisible ? "active" : ""}`}>
        <button
          className={`btn--filters btn btn--md btn--secondary ${filtersVisible ? "active" : ""}`}
          onClick={() => {
            store.Offers.setFiltersVisible(!filtersVisible);
          }}>
          <i className="icon icon--vs filter--icon" />
          <span>FILTERS</span>
          <i
            className={`icon icon--vs filter--icon icon--filter-${
              theme === "dark" ? "light" : "dark"
            }${filtersVisible ? "--down" : "--striped"}`}
          />
        </button>
        <div className={`offers-filters ${filtersVisible ? "active" : ""}`}>
          <Filter
            title="COLLECTIONS"
            type="custom"
            customComponent={
              <>
                <CustomMultiSelect
                  title="Select collections"
                  options={filterCollection}
                  values={filterCollectionSelected}
                  clearFilters={clearFilters}
                  onCheck={store.Offers.setFilterCollection}
                />
              </>
            }
          />
          <Filter
            title="LOAN AMOUNT"
            titleComponent={
              <CustomSelect
                classNames="offers-filters-select"
                options={["All", "USDC", "SOL"]}
                selectedOption={filterCurrency}
                setSelectedOption={switchCurrency}
              />
            }
            type="minmax"
            valuesRange={{ min: filterAmountMin, max: filterAmountMax }}
            actionMin={store.Offers.setFilterAmountMin}
            actionMax={store.Offers.setFilterAmountMax}
            actionValidatorMin={store.Offers.filterAmountValidatorMin}
            actionValidatorMax={store.Offers.filterAmountValidatorMax}
            minRef={amountMinRef}
            maxRef={amountMaxRef}
          />
          <Filter
            title="APR"
            type="minmax"
            valuesRange={{ min: filterAprMin, max: filterAprMax }}
            actionMin={store.Offers.setFilterAprMin}
            actionMax={store.Offers.setFilterAprMax}
            actionValidatorMin={store.Offers.filterAprValidatorMin}
            actionValidatorMax={store.Offers.filterAprValidatorMax}
            minRef={aprMinRef}
            maxRef={aprAprMax}
          />
          <Filter
            title="DURATION (DAYS)"
            type="minmax"
            valuesRange={{ min: filterDurationMin, max: filterDurationMax }}
            actionMin={store.Offers.setFilterDurationMin}
            actionMax={store.Offers.setFilterDurationMax}
            actionValidatorMin={store.Offers.filterDurationValidatorMin}
            actionValidatorMax={store.Offers.filterDurationValidatorMax}
            minRef={durationMinRef}
            maxRef={durationMaxRef}
          />
          <div className={`offers-filters__reset`}>
            <i onClick={resetFilters} className="icon icon--sm icon--interactive icon--reset" />
          </div>
        </div>
      </div>
      <div className="offers-top">
        <h1>Offers</h1>
        <div className="reward">
          <i className="icon icon--svs icon--info--dark" />
          <p>
            Current estimated reward APR: <span>12.5%</span>
            <i className={`icon icon--svs icon--unloc--${theme === "dark" ? "light" : "dark"}`} />
          </p>
        </div>
        <div className="offers-view">
          <button
            className={`btn btn--md btn--grid btn--bordered ${viewType === "grid" ? "active" : ""}`}
            onClick={() => store.Offers.setViewType("grid")}>
            <span>Grid</span>
            <i
              className={`icon icon--vs-wide-width2 icon--grid ${
                viewType === "grid" ? "active" : ""
              }`}
            />
          </button>
          <button
            className={`btn btn--md btn--table btn--bordered ${
              viewType === "table" ? "active" : ""
            }`}
            onClick={() => store.Offers.setViewType("table")}>
            <span>Table</span>
            <i
              className={`icon icon--vs-wide-width icon--table ${
                viewType === "table" ? "active" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
});
