using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace sudoku1.DAL.UnitOfWork
{
    public interface IUnitOfWork
    {
        //calls dbContext.saveChanges
        void Commit();
    }
}
