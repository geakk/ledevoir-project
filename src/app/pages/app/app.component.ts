import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from 'src/app/services/data.service';
import { FilterEventsService } from 'src/app/services/filter-events.service';
import { ThemeService } from 'src/app/services/theme.service';

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

  

  filterableAttributes: FilterableAttribute[] = [];
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
    this.isLoading = false;
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
  }

  private setAttributeGlobalVariables(attribute: FilterableAttribute): void {
    attribute.allSelected = attribute.options.every((o) => o.selected);
    attribute.someSelected =
      attribute.allSelected || attribute.options.some((o) => o.selected);
  }

}
