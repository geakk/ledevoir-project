import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FilterEventsService } from 'src/app/services/filter-events.service';
import { IntroJs } from 'intro.js';
import { MatDrawer } from '@angular/material/sidenav';
import { MatIconRegistry } from '@angular/material/icon';
import { RawDataEntry } from 'src/app/interfaces/data-entry.interface';
import { ThemeService } from 'src/app/services/theme.service';

declare var introJs: any;

interface Option {
  label: string;
  selected: boolean;
}

interface FilterableAttribute {
  name: string;
  key: string;
  options: Option[];
  allSelected: boolean;
  someSelected: boolean;
  filter: string;
  filteredOptions: Option[];
  useAutocomplete: boolean;
  expanded: boolean;
}

const TOUR_KEY = 'reussito-visited-guide';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', './theme-picker.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer | undefined;

  isLoading = true;
  schoolName: string = '';

  separatorKeysCodes: number[] = [ENTER, COMMA];

  readonly filterableColumns = [
    {
      label: 'Niveau',
      accessor: (row: RawDataEntry) => row.level,
      key: 'level',
    },
    {
      label: 'Foyer',
      accessor: (row: RawDataEntry) => row.class,
      key: 'class',
    },
    {
      label: 'Matière',
      accessor: (row: RawDataEntry) => row.course,
      key: 'course',
    },
    {
      label: 'Enjeu',
      accessor: (row: RawDataEntry) => row.stake,
      key: 'stake',
    },
    {
      label: 'Sentiment',
      accessor: (row: RawDataEntry) => row.sentiment,
      key: 'sentiment',
    },
    {
      label: 'Étudiant',
      accessor: (row: RawDataEntry) =>
        `${row.studentName} (${row.permanentCode})`,
      key: 'studentName',
    },
  ];

  filterableAttributes: FilterableAttribute[] = [];

  filteredData: RawDataEntry[] = [];

  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly dataService: DataService,
    // eslint-disable-next-line no-unused-vars
    private readonly matIconRegistry: MatIconRegistry,
    // eslint-disable-next-line no-unused-vars
    private readonly sanitizer: DomSanitizer,
    // eslint-disable-next-line no-unused-vars
    public readonly themeService: ThemeService,
    // eslint-disable-next-line no-unused-vars
    private readonly filterEventService: FilterEventsService,
    // eslint-disable-next-line no-unused-vars
    public readonly cdr: ChangeDetectorRef
  ) {
    this.addIconsToRegistry();
  }

  private addIconsToRegistry(): void {
    this.matIconRegistry.addSvgIcon(
      'classroom',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/classroom.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'theme-example',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/theme-demo-icon.svg'
      )
    );
  }

  async ngOnInit(): Promise<void> {
    await this.dataService.loadData();
    this.schoolName = this.dataService.schoolName;
    this.filterableAttributes = this.getAllFilterableAttributes();
    this.filter();
    this.isLoading = false;
    this.filterEventService.dataFilter$.subscribe((d) => {
      this.applyFilters(d);
    });
    const alreadyDoneTour = localStorage.getItem(TOUR_KEY) === 'true';
    setTimeout(async () => {
      if (!alreadyDoneTour) {
        await this.onStartTour();
      }
      window.localStorage[TOUR_KEY] = 'true';
    }, 2000);
  }

  private getAllFilterableAttributes(): FilterableAttribute[] {
    const filterableAttributes: FilterableAttribute[] = [];
    for (const filterableColumn of this.filterableColumns) {
      const options = new Set<string>();
      for (const row of this.dataService.rawData) {
        options.add(filterableColumn.accessor(row));
      }
      const filterableAttribute: FilterableAttribute = {
        name: filterableColumn.label,
        options: Array.from(options)
          .sort()
          .map((o) => ({ label: o, selected: true })),
        allSelected: true,
        someSelected: true,
        filter: '',
        filteredOptions: [],
        useAutocomplete: filterableColumn.label === 'Étudiant',
        key: filterableColumn.key,
        expanded: true,
      };
      filterableAttributes.push(filterableAttribute);
    }
    return filterableAttributes;
  }

  onFilterInputChange(filterableAttribute: FilterableAttribute): void {
    filterableAttribute.filteredOptions = filterableAttribute.options.filter(
      (o) =>
        o.label
          .toLowerCase()
          .includes(filterableAttribute.filter.trim().toLowerCase())
    );
  }

  onSetAll(filterableAttribute: FilterableAttribute, checked: boolean): void {
    const levelAndClassAttributes = this.filterableAttributes.filter((a) =>
      ['Niveau', 'Foyer'].includes(a.name)
    );
    if (levelAndClassAttributes.includes(filterableAttribute)) {
      levelAndClassAttributes.forEach((a) => this.setAll(a, checked));
    } else {
      this.setAll(filterableAttribute, checked);
    }
  }

  private setAll(
    filterableAttribute: FilterableAttribute,
    checked: boolean
  ): void {
    filterableAttribute.allSelected = checked;
    filterableAttribute.someSelected = checked;
    for (const option of filterableAttribute.options) {
      option.selected = checked;
    }
    this.filter();
  }

  onSet(
    filterableAttribute: FilterableAttribute,
    option: Option,
    checked: boolean
  ): void {
    option.selected = checked;
    const levelAttribute = this.filterableAttributes.find(
      (a) => a.name === 'Niveau'
    )!;
    const classAttribute = this.filterableAttributes.find(
      (a) => a.name === 'Foyer'
    )!;
    if (filterableAttribute === levelAttribute) {
      classAttribute.options.forEach((o) => {
        if (o.label.startsWith(option.label[1])) {
          o.selected = checked;
        }
      });
      this.setAttributeGlobalVariables(filterableAttribute);
      this.setAttributeGlobalVariables(classAttribute);
    } else if (filterableAttribute === classAttribute) {
      const levelOption = levelAttribute.options.find(
        (o) => o.label[1] === option.label[0]
      )!;
      levelOption.selected = classAttribute.options.some(
        (o) => o.selected && o.label[0] === levelOption.label[1]
      );
      this.setAttributeGlobalVariables(filterableAttribute);
      this.setAttributeGlobalVariables(classAttribute);
    } else {
      this.setAttributeGlobalVariables(filterableAttribute);
    }
    this.filter();
  }

  private setAttributeGlobalVariables(attribute: FilterableAttribute): void {
    attribute.allSelected = attribute.options.every((o) => o.selected);
    attribute.someSelected =
      attribute.allSelected || attribute.options.some((o) => o.selected);
  }

  private filter(): void {
    const filteredData: RawDataEntry[] = [];
    const filters = this.filterableColumns.map((f) => {
      return {
        ...f,
        values: new Set(
          this.filterableAttributes
            .find((a) => a.name === f.label)
            ?.options.filter((o) => o.selected === true)
            .map((o) => o.label)
        ),
      };
    });
    for (const row of this.dataService.rawData) {
      let shouldKeepRow = true;
      for (const filter of filters) {
        const value = filter.accessor(row);
        if (!filter.values.has(value)) {
          shouldKeepRow = false;
          break;
        }
      }
      if (shouldKeepRow) {
        filteredData.push(row);
      }
    }
    if (JSON.stringify(this.filteredData) !== JSON.stringify(filteredData)) {
      this.filteredData = this.dataService.computeStakesAvgs(filteredData);
    }
    this.cdr.detectChanges();
  }

  onlySelected(options: Option[]): Option[] {
    return options.filter((o) => o.selected);
  }

  onClickOnOption(
    filterableAttribute: FilterableAttribute,
    optionLabel: string
  ): void {
    if (filterableAttribute.allSelected) {
      for (const option of filterableAttribute.options) {
        option.selected = false;
      }
    }
    filterableAttribute.allSelected = false;
    const option = filterableAttribute.options.find(
      (o) => o.label === optionLabel
    );
    option!.selected = true;
    this.filter();
  }

  onRemoveChip(filterableAttribute: FilterableAttribute, option: Option): void {
    option.selected = false;
    filterableAttribute.someSelected = filterableAttribute.options.some(
      (o) => o.selected
    );
    if (!filterableAttribute.someSelected) {
      filterableAttribute.someSelected = true;
      filterableAttribute.allSelected = true;
      for (const option of filterableAttribute.options) {
        option.selected = true;
      }
    }
    this.filter();
  }

  private applyFilters(data: Partial<RawDataEntry>): void {
    this.filterableAttributes = this.filterableAttributes.map(
      (filterableAttribute) => {
        if (!(filterableAttribute.key in data)) {
          return {
            ...filterableAttribute,
            expanded: !filterableAttribute.allSelected,
          };
        }
        const filterableAttributeModified = { ...filterableAttribute };
        filterableAttributeModified.allSelected = false;
        filterableAttributeModified.someSelected = true;
        filterableAttributeModified.expanded = true;
        filterableAttributeModified.options =
          filterableAttributeModified.options.map((option) => {
            return {
              ...option,
              selected:
                option.label ===
                data[filterableAttribute.key as keyof RawDataEntry],
            };
          });
        this.onFilterInputChange(filterableAttributeModified);
        return filterableAttributeModified;
      }
    );
    this.filter();
    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.filterableAttributes = this.getAllFilterableAttributes();
    this.filter();
  }

  async onStartTour(): Promise<void> {
    if (!this.drawer!.opened) {
      await this.drawer!.open();
    }
    this.startTour();
  }

  private startTour(): void {
    this.filterableAttributes[0].expanded = true;
    const intro: IntroJs = introJs();
    intro.setOptions({
      steps: [
        {
          element: '#introjs-change-theme',
          intro: `Ce panneau permet de choisir le thème des couleurs général appliqué à l'application. Ce thème est adapté aux coleurs des graphiques, et des sections.`,
          position: 'auto',
          title: 'Thème',
        },
        {
          element: '#introjs-open-close-filters',
          intro: `Ce panneau contient tous les filtres applicables à l'application. Les graphiques sont automatiques adaptés aux entrées des filtres. Une fois que les filtres changent, le contenu des graphiques est modifié.`,
          position: 'auto',
          title: 'Panneau latéral des filtres',
        },
        {
          element: '#introjs-filters-reset',
          intro: `Ce bouton permet de rénitialiser les filtres. Les filtres se retrouvent dans leur état par défaut comme à l'ouverture de l'application.`,
          position: 'auto',
          title: 'Réinitialisation des filtres',
        },
        {
          element: 'mat-checkbox.mat-checkbox-option',
          intro: `Les cases à cocher suivantes permmettent de sélectionner les sections dont on apercevoir les statistiques. Les graphiques sont modifiés en conséquences.`,
          position: 'auto',
          title: 'Choix de section',
        },
        {
          element: '#introjs-average',
          intro: `Dans cette section se trouve la moyenne générale associée aux <b>étudiants</b>, aux <b>matières</b>, aux <b>sections</b> aux <b>enjeux</b>, aux <b>foyers</b> et aux <b>sentiments</b> choisis.`,
          position: 'auto',
          title: 'Moyenne générale',
        },
        {
          element: '#introjs-average-comments-summary',
          intro: `C'est le ration de commentaires positifs et négatifs associés aux filtres appliqués. Une fois que les filtres changent, le contenu du graphique est modifié. `,
          position: 'auto',
          title: 'Commentaires',
        },
        {
          element: '#introjs-main-visualisation .quadrants',
          intro: `Dans cette vue se trouvent les <b>étudiants concernés</b> par les <b>filtres appliqués</b>. Chaque point représente un étudiant. La couleur d'un étudiant ccoresspond à la section dans laquelle il se trouve. Le code couleur des sections se trouve dans la légende située à droite de ce graphique. Les couleurs des sections changent en <b>fonction du thème de couleur choisi</b>. Une fois un étudiant sélectionné, tous les graphiques ne montrent que les statistiques de cet étudiant et les filtres sont mis à jour en conséquence.`,
          position: 'auto',
          title: 'Vue générale',
        },
        {
          element: '#introjs-stakes',
          intro: `Cette vue ne prend en compte que les sentiments. Cette vue est mise à jour dès que les filtres changent.`,
          position: 'auto',
          title: 'Vue des enjeux assoicés aux étudiants',
        },
        {
          element: '#introjs-course-comparison',
          intro: `Cette  vue compare le comportemment et le niveau des élèves en fonction des matières. Cette vue est mise à jour dès que les filtres changent.`,
          position: 'auto',
          title: 'Vue par matière',
        },
        {
          element: '#introjs-level-comparison',
          intro: `Cette vue compare le comportemment et le niveau des élèves en fonction des classes. Cette vue est mise à jour dès que les filtres changent.`,
          position: 'auto',
          title: 'Comparaison entre niveaux',
        },
      ],
      showBullets: true,
      showButtons: true,
      exitOnOverlayClick: true,
      keyboardNavigation: true,
      nextLabel: 'Suivant',
      doneLabel: 'Fin',
      prevLabel: 'Précédent',
      skipLabel: '',
    });
    intro.onbeforechange((targetElem: HTMLElement) => {
      const scrollParent = this.getScrollParent(targetElem);
      if (!scrollParent) return;
      scrollParent.scrollTop =
        targetElem.offsetTop - scrollParent.offsetTop - 90;
    });
    intro.start();
  }

  private getScrollParent(node: HTMLElement): HTMLElement | undefined {
    if (node == null) {
      return undefined;
    }
    if (node.scrollHeight > node.clientHeight) {
      return node;
    } else {
      return this.getScrollParent(node.parentNode as HTMLElement);
    }
  }
}
